-- =============================================================================
-- Testhjelpere for pgTAP
-- =============================================================================
-- Denne filen kjøres først (alfabetisk) og blir værende i testdatabasen, slik at
-- de andre testfilene kan bruke hjelperne. Den kjører aldri mot produksjon.
--
--   tests.create_user(e-post, navn)    oppretter en bekreftet bruker i auth.users
--   tests.login_as(bruker-id)          resten av transaksjonen kjører som brukeren
--   tests.login_as_anon()              resten av transaksjonen kjører som anon
--   tests.logout()                     tilbake til testrollen (postgres)
--   tests.seed_organization('a')       komplett organisasjon med data i alle tabeller
--   tests.id('a', 'unit_sold')         id fra fixturen, kan brukes av alle roller

create extension if not exists pgtap with schema extensions;

create schema if not exists tests;
grant usage on schema tests to anon, authenticated, service_role;

create table if not exists tests.fixtures (
  org_key text not null,
  name text not null,
  id uuid not null,
  primary key (org_key, name)
);

create or replace function tests.create_user(p_email text, p_full_name text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', p_email, '',
    now(), '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('full_name', coalesce(p_full_name, p_email)), now(), now()
  );
  return v_id;
end;
$$;

create or replace function tests.user_email(p_user_id uuid)
returns text
language sql
security definer
set search_path = ''
as $$ select u.email::text from auth.users u where u.id = p_user_id $$;

create or replace function tests.login_as(p_user_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform set_config('role', 'none', true);
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object(
      'sub', p_user_id,
      'role', 'authenticated',
      'email', tests.user_email(p_user_id),
      'is_anonymous', false
    )::text,
    true
  );
  perform set_config('role', 'authenticated', true);
end;
$$;

create or replace function tests.login_as_anon()
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform set_config('role', 'none', true);
  perform set_config('request.jwt.claims', '{"role": "anon"}', true);
  perform set_config('role', 'anon', true);
end;
$$;

create or replace function tests.logout()
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform set_config('role', 'none', true);
  perform set_config('request.jwt.claims', '', true);
end;
$$;

create or replace function tests.id(p_org_key text, p_name text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select f.id from tests.fixtures f where f.org_key = p_org_key and f.name = p_name
$$;

-- Fanger SQLSTATE, slik at tester kan sjekke at noe avvises uansett hvilken rolle som kjører.
create or replace function tests.sqlstate_of(p_sql text)
returns text
language plpgsql
set search_path = ''
as $$
begin
  execute p_sql;
  return '00000';
exception when others then
  return sqlstate;
end;
$$;

-- Antall rader en setning påvirker, eller SQLSTATE hvis den avvises.
create or replace function tests.affected_rows(p_sql text)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_count bigint;
begin
  execute p_sql;
  get diagnostics v_count = row_count;
  return v_count::text;
exception when others then
  return sqlstate;
end;
$$;

-- ---------------------------------------------------------------------------
-- Generiske forsøk mot en tabell, brukt av isolasjonstesten. Kjører med
-- rettighetene til rollen som er logget inn, og returnerer antall rader,
-- 'no-privilege' (rollen har ikke rettigheten i det hele tatt) eller SQLSTATE.
-- ---------------------------------------------------------------------------

create or replace function tests.visible_rows(p_table text, p_organization_id uuid)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_count bigint;
begin
  if not has_table_privilege(current_user, format('public.%I', p_table), 'SELECT') then
    return 'no-privilege';
  end if;
  execute format('select count(*) from public.%I where organization_id = $1', p_table)
    into v_count using p_organization_id;
  return v_count::text;
exception when others then
  return sqlstate;
end;
$$;

-- Prøver å sette inn en kopi (med ny id) av en eksisterende rad, med bare de
-- kolonnene rollen har INSERT-rettighet til. Valgfrie referanser (uuid som kan
-- være null, og uuid-lister) tømmes, slik at valideringstriggere ikke stopper
-- forsøket før RLS-regelen blir prøvd. Forventet svar er da 42501 fra RLS.
create or replace function tests.try_insert(p_table text, p_row jsonb)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_columns text;
  v_row jsonb := p_row || jsonb_build_object('id', gen_random_uuid());
  v_column record;
begin
  for v_column in
    select c.attname, c.attnotnull, c.atttypid
    from pg_attribute c
    where c.attrelid = format('public.%I', p_table)::regclass
      and c.attnum > 0 and not c.attisdropped
      and c.atttypid in ('uuid'::regtype, 'uuid[]'::regtype)
      and c.attname <> 'id'
  loop
    if v_column.atttypid = 'uuid[]'::regtype then
      v_row := v_row || jsonb_build_object(v_column.attname, '[]'::jsonb);
    elsif not v_column.attnotnull then
      v_row := v_row || jsonb_build_object(v_column.attname, null);
    end if;
  end loop;

  select string_agg(quote_ident(c.attname), ', ' order by c.attnum)
    into v_columns
  from pg_attribute c
  where c.attrelid = format('public.%I', p_table)::regclass
    and c.attnum > 0
    and not c.attisdropped
    and c.attgenerated = ''
    and has_column_privilege(current_user, c.attrelid, c.attnum, 'INSERT')
    and v_row ? c.attname;

  if v_columns is null then
    return 'no-privilege';
  end if;

  execute format(
    'insert into public.%1$I (%2$s) select %2$s from jsonb_populate_record(null::public.%1$I, $1)',
    p_table, v_columns
  ) using v_row;
  return 'inserted';
exception when others then
  return sqlstate;
end;
$$;

-- Prøver en uskyldig oppdatering (kolonne = kolonne) av en organisasjons rader.
create or replace function tests.try_update(p_table text, p_organization_id uuid)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_column text;
  v_count bigint;
begin
  select c.attname
    into v_column
  from pg_attribute c
  where c.attrelid = format('public.%I', p_table)::regclass
    and c.attnum > 0
    and not c.attisdropped
    and c.attgenerated = ''
    and has_column_privilege(current_user, c.attrelid, c.attnum, 'UPDATE')
  order by c.attnum
  limit 1;

  if v_column is null then
    return 'no-privilege';
  end if;

  execute format('update public.%I set %I = %I where organization_id = $1', p_table, v_column, v_column)
    using p_organization_id;
  get diagnostics v_count = row_count;
  return v_count::text;
exception when others then
  return sqlstate;
end;
$$;

create or replace function tests.try_delete(p_table text, p_organization_id uuid)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_count bigint;
begin
  if not has_table_privilege(current_user, format('public.%I', p_table), 'DELETE') then
    return 'no-privilege';
  end if;
  execute format('delete from public.%I where organization_id = $1', p_table) using p_organization_id;
  get diagnostics v_count = row_count;
  return v_count::text;
exception when others then
  return sqlstate;
end;
$$;

-- Sjekksum av alle en organisasjons rader i en tabell (kjøres som postgres).
create or replace function tests.table_checksum(p_table text, p_organization_id uuid)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_checksum text;
begin
  execute format(
    'select md5(coalesce(string_agg(t::text, ''|'' order by t.id), '''')) from public.%I t where organization_id = $1',
    p_table
  ) into v_checksum using p_organization_id;
  return v_checksum;
end;
$$;

-- Én rad fra en organisasjon som jsonb (kjøres som postgres).
create or replace function tests.sample_row(p_table text, p_organization_id uuid)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row jsonb;
begin
  execute format(
    'select to_jsonb(t) from public.%I t where organization_id = $1 order by t.id limit 1',
    p_table
  ) into v_row using p_organization_id;
  return v_row;
end;
$$;

-- Lager en komplett organisasjon med data i alle tabeller som har organization_id.
-- Kjøres som postgres. Publisering og statusendring gjøres som eieren via RPC.
create or replace function tests.seed_organization(p_key text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_owner uuid;
  v_admin uuid;
  v_editor uuid;
  v_agent uuid;
  v_org uuid;
  v_project uuid;
  v_project_other uuid;
  v_stage uuid;
  v_building uuid;
  v_asset uuid;
  v_unit_available uuid;
  v_unit_sold uuid;
  v_unit_hidden uuid;
  v_selector uuid;
  v_view_overview uuid;
  v_view_building uuid;
  v_hotspot_view uuid;
  v_hotspot_unit uuid;
  v_hotspot_sold uuid;
  v_site uuid;
  v_page_home uuid;
  v_page_about uuid;
  v_domain uuid;
  v_lead uuid;
  v_api_key uuid;
  v_webhook uuid;
  v_invitation uuid;
begin
  v_owner := tests.create_user(p_key || '-eier@example.test', 'Eier ' || upper(p_key));
  v_admin := tests.create_user(p_key || '-admin@example.test', 'Admin ' || upper(p_key));
  v_editor := tests.create_user(p_key || '-redaktor@example.test', 'Redaktør ' || upper(p_key));
  v_agent := tests.create_user(p_key || '-megler@example.test', 'Megler ' || upper(p_key));

  perform tests.login_as(v_owner);
  v_org := public.create_organization('Organisasjon ' || upper(p_key), 'org-' || p_key);
  perform tests.logout();

  insert into public.memberships (organization_id, user_id, role)
  values (v_org, v_admin, 'admin'), (v_org, v_editor, 'editor'), (v_org, v_agent, 'agent');

  insert into public.projects (organization_id, name, slug, phase, settings, contacts, analytics_ids)
  values (
    v_org, 'Prosjekt ' || upper(p_key), 'prosjekt-' || p_key, 'for_sale',
    '{"show_price_on_sold": false, "public_custom_fields": ["solforhold"]}',
    jsonb_build_array(jsonb_build_object(
      'name', 'Megler ' || upper(p_key), 'title', 'Eiendomsmegler', 'email', p_key || '-megler@example.test',
      'phone', '+47 900 00 000', 'user_id', v_agent, 'receives_leads', true
    )),
    '{"ga4": "G-TEST"}'
  )
  returning id into v_project;

  insert into public.projects (organization_id, name, slug)
  values (v_org, 'Annet prosjekt ' || upper(p_key), 'annet-' || p_key)
  returning id into v_project_other;

  insert into public.project_members (organization_id, project_id, user_id)
  values (v_org, v_project, v_editor), (v_org, v_project, v_agent);

  insert into public.stages (organization_id, project_id, name, phase)
  values (v_org, v_project, 'Byggetrinn 1', 'for_sale')
  returning id into v_stage;

  insert into public.buildings (organization_id, project_id, stage_id, name)
  values (v_org, v_project, v_stage, 'Bygg A')
  returning id into v_building;

  insert into public.assets (organization_id, project_id, storage_path, mime, width, height, bytes, alt_text, filename)
  values (
    v_org, v_project, v_org::text || '/' || gen_random_uuid()::text || '/original.jpg',
    'image/jpeg', 2400, 1600, 123456, 'Fasade', 'fasade.jpg'
  )
  returning id into v_asset;

  insert into public.units (
    organization_id, project_id, stage_id, building_id, unit_number, floor, rooms, bedrooms, bra_i,
    price, purchase_costs, shared_debt, monthly_fee, status, floor_plan_asset_ids, custom_fields,
    external_id, source, sort_order, description
  )
  values (
    v_org, v_project, v_stage, v_building, 'A-101', 1, 3, 2, 68.5, 4250000, 106250, 0, 3500,
    'available', array[v_asset], '{"solforhold": "Kveldssol", "intern_kommentar": "INTERN-HEMMELIGHET"}',
    'EKSTERN-ID-HEMMELIG', 'import', 1, 'Lys og fin leilighet.'
  )
  returning id into v_unit_available;

  insert into public.units (organization_id, project_id, stage_id, building_id, unit_number, floor, rooms, bra_i,
                            price, purchase_costs, status, sort_order)
  values (v_org, v_project, v_stage, v_building, 'A-302', 3, 4, 92.0, 6950000, 173750, 'sold', 2)
  returning id into v_unit_sold;

  insert into public.units (organization_id, project_id, unit_number, floor, rooms, price, is_hidden, sort_order)
  values (v_org, v_project, 'A-303', 3, 2, 3900000, true, 3)
  returning id into v_unit_hidden;

  insert into public.selectors (organization_id, project_id, name, settings)
  values (v_org, v_project, 'Boligvelger', '{"filters": ["status", "rooms", "price"]}')
  returning id into v_selector;

  insert into public.selector_views (organization_id, project_id, selector_id, name, kind, asset_id, image_width, image_height)
  values (v_org, v_project, v_selector, 'Oversikt', 'overview', v_asset, 2400, 1600)
  returning id into v_view_overview;

  insert into public.selector_views (organization_id, project_id, selector_id, parent_view_id, name, kind, asset_id,
                                     image_width, image_height, angle_group, sort_order)
  values (v_org, v_project, v_selector, v_view_overview, 'Bygg A', 'facade', v_asset, 2400, 1600, 'bygg-a', 1)
  returning id into v_view_building;

  update public.selectors set entry_view_id = v_view_overview where id = v_selector;

  insert into public.hotspots (organization_id, project_id, view_id, shape, points, target_type, target_view_id, label)
  values (v_org, v_project, v_view_overview, 'polygon', '[[0.1, 0.1], [0.5, 0.1], [0.5, 0.6], [0.1, 0.6]]',
          'view', v_view_building, 'Bygg A')
  returning id into v_hotspot_view;

  insert into public.hotspots (organization_id, project_id, view_id, shape, points, target_type, target_unit_id)
  values (v_org, v_project, v_view_building, 'polygon', '[[0.1, 0.2], [0.3, 0.2], [0.3, 0.4], [0.1, 0.4]]',
          'unit', v_unit_available)
  returning id into v_hotspot_unit;

  insert into public.hotspots (organization_id, project_id, view_id, shape, points, target_type, target_unit_id)
  values (v_org, v_project, v_view_building, 'rect', '[[0.4, 0.2], [0.6, 0.4]]', 'unit', v_unit_sold)
  returning id into v_hotspot_sold;

  insert into public.sites (organization_id, project_id, subdomain, nav)
  values (v_org, v_project, p_key || '-prosjekt', '[{"label": "Boliger", "href": "/"}]')
  returning id into v_site;

  insert into public.pages (organization_id, project_id, site_id, title, slug, is_home, draft_blocks)
  values (
    v_org, v_project, v_site, 'Forside', 'forside', true,
    jsonb_build_array(
      jsonb_build_object('id', 'b1', 'type', 'hero', 'props', jsonb_build_object('title', 'Velkommen')),
      jsonb_build_object('id', 'b2', 'type', 'selector', 'props', jsonb_build_object('selector_id', v_selector)),
      jsonb_build_object('id', 'b3', 'type', 'text', 'hidden', true, 'props', jsonb_build_object('text', 'SKJULT-UTKAST'))
    )
  )
  returning id into v_page_home;

  insert into public.pages (organization_id, project_id, site_id, title, slug, sort_order, draft_blocks)
  values (v_org, v_project, v_site, 'Om prosjektet', 'om-prosjektet', 1,
          '[{"id": "c1", "type": "text", "props": {"text": "Om oss"}}]')
  returning id into v_page_about;

  insert into public.domains (organization_id, project_id, site_id, hostname, is_primary, status, verified_at)
  values (v_org, v_project, v_site, 'www.' || p_key || '-prosjekt.test', true, 'verified', now())
  returning id into v_domain;

  insert into public.api_keys (organization_id, name, key_prefix, key_hash, scopes, created_by)
  values (v_org, 'Integrasjon', 'pk_' || p_key || '_test', encode(sha256(convert_to('api-' || p_key, 'UTF8')), 'hex'),
          '{units:read}', v_owner)
  returning id into v_api_key;

  insert into public.webhooks (organization_id, url, events, secret, created_by)
  values (v_org, 'https://hooks.example.test/' || p_key, '{unit.status_changed,lead.created}',
          repeat('s', 40), v_owner)
  returning id into v_webhook;

  insert into public.leads (organization_id, project_id, unit_id, page_id, name, email, phone, message,
                            consent_contact, consent_text_version, source)
  values (v_org, v_project, v_unit_available, v_page_home, 'Kari Kjøper', p_key || '-kari@example.test',
          '+47 911 11 111', 'Interessert i A-101', true, 'v1', 'site')
  returning id into v_lead;

  insert into public.invitations (organization_id, email, role, project_ids, token_hash, invited_by)
  values (v_org, p_key || '-ny@example.test', 'editor', array[v_project],
          encode(sha256(convert_to('invitasjon-' || p_key, 'UTF8')), 'hex'), v_owner)
  returning id into v_invitation;

  perform public.rate_limit_hit(v_org, 'lead:testhash', 5, 60);

  -- Publisering, statusendring og innlogging som eier: gir page_versions,
  -- unit_status_events, audit_log og webhook_deliveries.
  perform tests.login_as(v_owner);
  perform public.publish_selector(v_selector);
  perform public.publish_site(v_site);
  perform public.set_unit_status(array[v_unit_available], 'reserved', 'Reservert for Kari', 'table');
  perform public.set_unit_status(array[v_unit_available], 'available', null, 'selector');
  perform public.record_login();
  perform tests.logout();

  insert into tests.fixtures (org_key, name, id)
  values
    (p_key, 'owner', v_owner),
    (p_key, 'admin', v_admin),
    (p_key, 'editor', v_editor),
    (p_key, 'agent', v_agent),
    (p_key, 'org', v_org),
    (p_key, 'project', v_project),
    (p_key, 'project_other', v_project_other),
    (p_key, 'stage', v_stage),
    (p_key, 'building', v_building),
    (p_key, 'asset', v_asset),
    (p_key, 'unit_available', v_unit_available),
    (p_key, 'unit_sold', v_unit_sold),
    (p_key, 'unit_hidden', v_unit_hidden),
    (p_key, 'selector', v_selector),
    (p_key, 'view_overview', v_view_overview),
    (p_key, 'view_building', v_view_building),
    (p_key, 'hotspot_view', v_hotspot_view),
    (p_key, 'hotspot_unit', v_hotspot_unit),
    (p_key, 'hotspot_sold', v_hotspot_sold),
    (p_key, 'site', v_site),
    (p_key, 'page_home', v_page_home),
    (p_key, 'page_about', v_page_about),
    (p_key, 'domain', v_domain),
    (p_key, 'lead', v_lead),
    (p_key, 'api_key', v_api_key),
    (p_key, 'webhook', v_webhook),
    (p_key, 'invitation', v_invitation);
end;
$$;

grant execute on all functions in schema tests to anon, authenticated, service_role;

select plan(1);
select ok(to_regprocedure('tests.seed_organization(text)') is not null, 'Testhjelpere er installert');
select * from finish();
