-- =============================================================================
-- 0011 Fase 3: prosjektside og leads
-- =============================================================================
--
-- Prosjektsiden opprettes fra en mal i én transaksjon. Blokkene valideres i
-- appen (Zod) og lagres som JSON i pages.draft_blocks. Publisering, versjoner
-- og offentlige oppslag finnes fra før (0005 og 0006).
--
-- Leads legges bare inn av serveren (service-rollen) etter Turnstile og
-- honeypot. submit_lead() sjekker prosjektet, enheten og rate limit i
-- databasen, så ingen kan omgå reglene ved å kalle funksjonen direkte.

-- -----------------------------------------------------------------------------
-- Opprett prosjektside fra mal
-- -----------------------------------------------------------------------------
-- p_site:  { theme, nav, footer, seo_defaults }
-- p_pages: [{ id, title, slug, is_home, blocks }] i rekkefølge. Id-ene lages i
--          appen, så menyen kan peke på sidene før de finnes.

-- Security definer fordi opprettelsen skrives til revisjonsloggen. Tilgangen
-- sjekkes først, med samme regel som RLS-policyene for sites og pages.
create function public.create_site(p_project_id uuid, p_subdomain text, p_site jsonb, p_pages jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project public.projects;
  v_site_id uuid := gen_random_uuid();
  v_page jsonb;
  v_index integer := 0;
  v_homes integer;
begin
  select * into v_project from public.projects p where p.id = p_project_id;
  if not found or not app.has_project_role(p_project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til prosjektet' using errcode = '42501';
  end if;
  if p_pages is null or jsonb_typeof(p_pages) <> 'array'
     or jsonb_array_length(p_pages) not between 1 and 50 then
    raise exception 'Prosjektsiden må ha mellom 1 og 50 sider' using errcode = '22023';
  end if;
  select count(*) into v_homes
  from jsonb_array_elements(p_pages) as e(value)
  where coalesce((e.value ->> 'is_home')::boolean, false);
  if v_homes <> 1 then
    raise exception 'Prosjektsiden må ha nøyaktig én forside' using errcode = '22023';
  end if;
  if p_site is not null and jsonb_typeof(p_site) <> 'object' then
    raise exception 'Ugyldige innstillinger for prosjektsiden' using errcode = '22023';
  end if;

  insert into public.sites (id, organization_id, project_id, subdomain, theme, nav, footer, seo_defaults)
  values (
    v_site_id,
    v_project.organization_id,
    v_project.id,
    lower(btrim(p_subdomain)),
    coalesce(p_site -> 'theme', '{}'::jsonb),
    coalesce(p_site -> 'nav', '[]'::jsonb),
    coalesce(p_site -> 'footer', '{}'::jsonb),
    coalesce(p_site -> 'seo_defaults', '{}'::jsonb)
  );

  for v_page in select value from jsonb_array_elements(p_pages) loop
    v_index := v_index + 1;
    if jsonb_typeof(v_page) <> 'object' then
      raise exception 'Side % er ugyldig', v_index using errcode = '22023';
    end if;
    insert into public.pages (id, organization_id, project_id, site_id, title, slug, is_home, sort_order, draft_blocks)
    values (
      coalesce(app.try_uuid(v_page ->> 'id'), gen_random_uuid()),
      v_project.organization_id,
      v_project.id,
      v_site_id,
      btrim(v_page ->> 'title'),
      v_page ->> 'slug',
      coalesce((v_page ->> 'is_home')::boolean, false),
      v_index,
      coalesce(v_page -> 'blocks', '[]'::jsonb)
    );
  end loop;

  perform app.write_audit(
    v_project.organization_id, v_project.id, 'site.created', 'site', v_site_id,
    jsonb_build_object('subdomain', lower(btrim(p_subdomain)), 'pages', v_index)
  );
  return v_site_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Forside og rekkefølge på sider
-- -----------------------------------------------------------------------------

-- En prosjektside har nøyaktig én forside. Byttet skjer i én transaksjon.
create function public.set_home_page(p_page_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_page public.pages;
begin
  select * into v_page from public.pages p where p.id = p_page_id;
  if not found or not app.has_project_role(v_page.project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til å endre prosjektsiden' using errcode = '42501';
  end if;
  update public.pages set is_home = false where site_id = v_page.site_id and is_home and id <> v_page.id;
  update public.pages set is_home = true where id = v_page.id and not is_home;
end;
$$;

create function public.reorder_pages(p_site_id uuid, p_page_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_site public.sites;
begin
  select * into v_site from public.sites s where s.id = p_site_id;
  if not found or not app.has_project_role(v_site.project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til å endre prosjektsiden' using errcode = '42501';
  end if;
  if p_page_ids is null or cardinality(p_page_ids) = 0 or exists (
    select 1 from unnest(p_page_ids) as ids(id)
    where not exists (select 1 from public.pages p where p.id = ids.id and p.site_id = p_site_id)
  ) then
    raise exception 'Sidene må tilhøre prosjektsiden' using errcode = '22023';
  end if;

  update public.pages p
     set sort_order = ids.position
    from unnest(p_page_ids) with ordinality as ids(id, position)
   where p.id = ids.id
     and p.sort_order is distinct from ids.position;
end;
$$;

-- -----------------------------------------------------------------------------
-- Versjonshistorikk: gjenopprett en publisert versjon til utkastet
-- -----------------------------------------------------------------------------
-- Blokker, tittel og SEO hentes fra versjonen. Adressen (slug) beholdes, så
-- gjenoppretting aldri kolliderer med en annen side. Utkastet publiseres ikke.

create function public.restore_page_version(p_version_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.page_versions;
begin
  select * into v_version from public.page_versions pv where pv.id = p_version_id;
  if not found or not app.has_project_role(v_version.project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til å gjenopprette versjonen' using errcode = '42501';
  end if;

  update public.pages p
     set draft_blocks = v_version.blocks,
         title = coalesce(nullif(btrim(v_version.meta ->> 'title'), ''), p.title),
         seo_title = nullif(btrim(v_version.meta ->> 'seo_title'), ''),
         seo_description = nullif(btrim(v_version.meta ->> 'seo_description'), ''),
         og_asset_id = (
           select a.id from public.assets a
           where a.id = app.try_uuid(v_version.meta ->> 'og_asset_id')
             and a.organization_id = v_version.organization_id
         )
   where p.id = v_version.page_id;

  perform app.write_audit(
    v_version.organization_id, v_version.project_id, 'page.version_restored', 'page', v_version.page_id,
    jsonb_build_object('version', v_version.version)
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Er det endringer som ikke er publisert?
-- -----------------------------------------------------------------------------

create function public.get_site_publish_state(p_site_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_site public.sites;
  v_home uuid;
  v_changes boolean;
begin
  select * into v_site from public.sites s where s.id = p_site_id;
  if not found or not (
    app.has_project_role(v_site.project_id, app.roles_all(), false) or app.is_platform_admin()
  ) then
    raise exception 'Mangler tilgang til prosjektsiden' using errcode = '42501';
  end if;

  select p.id into v_home from public.pages p where p.site_id = v_site.id and p.is_home;

  v_changes := v_site.published_at is null
    or v_site.published_config is distinct from jsonb_build_object(
      'theme', v_site.theme,
      'nav', v_site.nav,
      'footer', v_site.footer,
      'seo_defaults', v_site.seo_defaults,
      'cookie_settings', v_site.cookie_settings,
      'home_page_id', v_home
    )
    or exists (
      select 1 from public.pages p
      where p.site_id = v_site.id
        and (
          p.published_at is null
          or p.published_blocks is distinct from app.visible_blocks(p.draft_blocks)
          or p.published_slug is distinct from p.slug
          or p.published_meta is distinct from jsonb_build_object(
            'title', p.title,
            'seo_title', p.seo_title,
            'seo_description', p.seo_description,
            'og_asset_id', p.og_asset_id
          )
        )
    );

  return jsonb_build_object('published_at', v_site.published_at, 'has_changes', v_changes);
end;
$$;

-- -----------------------------------------------------------------------------
-- Egne felt: hvilke nøkler som vises offentlig
-- -----------------------------------------------------------------------------

create function public.set_public_custom_fields(p_project_id uuid, p_keys text[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not app.has_project_role(p_project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til prosjektet' using errcode = '42501';
  end if;
  if p_keys is null or cardinality(p_keys) > 30 or exists (
    select 1 from unnest(p_keys) as k(key)
    where k.key is null or char_length(btrim(k.key)) not between 1 and 60 or k.key <> btrim(k.key)
  ) then
    raise exception 'Ugyldige feltnavn' using errcode = '22023';
  end if;

  update public.projects p
     set settings = p.settings || jsonb_build_object(
       'public_custom_fields',
       coalesce((select jsonb_agg(distinct k.key) from unnest(p_keys) as k(key)), '[]'::jsonb)
     )
   where p.id = p_project_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Interesseskjema: lead fra serveren
-- -----------------------------------------------------------------------------
-- p_lead: { project_id, unit_id, page_id, name, email, phone, message,
--           consent_contact, consent_similar_projects, consent_text_version, source, utm }
-- p_ip_hash: SHA-256 av avsenderens IP-adresse (IP-adressen lagres aldri).
--
-- Svarer med det serveren trenger for e-posten: mottakere, prosjekt, enhet og språk.
-- Mottakere er kontaktpersonene som tar imot leads. Har prosjektet ingen, går
-- e-posten til organisasjonens eiere og administratorer.

create function public.submit_lead(p_lead jsonb, p_ip_hash text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project public.projects;
  v_organization public.organizations;
  v_unit public.units;
  v_page_id uuid;
  v_lead_id uuid;
  v_email text := lower(btrim(p_lead ->> 'email'));
  v_recipients jsonb;
begin
  if p_lead is null or jsonb_typeof(p_lead) <> 'object' then
    raise exception 'Ugyldig henvendelse' using errcode = '22023';
  end if;

  select * into v_project from public.projects p where p.id = app.try_uuid(p_lead ->> 'project_id');
  if not found or not app.project_is_public(v_project.id) then
    raise exception 'Prosjektet tar ikke imot henvendelser' using errcode = 'P0002';
  end if;
  select * into v_organization from public.organizations o where o.id = v_project.organization_id;

  if nullif(p_lead ->> 'unit_id', '') is not null then
    select * into v_unit from public.units u
    where u.id = app.try_uuid(p_lead ->> 'unit_id') and u.project_id = v_project.id and not u.is_hidden;
    if not found then
      raise exception 'Enheten finnes ikke i prosjektet' using errcode = '23503';
    end if;
  end if;

  -- Siden må høre til prosjektets prosjektside. Ellers lagres leadet uten side.
  select pg.id into v_page_id from public.pages pg
  where pg.id = app.try_uuid(p_lead ->> 'page_id') and pg.project_id = v_project.id;

  if p_ip_hash is not null and not public.rate_limit_hit(v_project.organization_id, 'lead:ip:' || left(p_ip_hash, 64), 5, 600) then
    raise exception 'For mange henvendelser fra samme adresse' using errcode = 'P0429';
  end if;
  if v_email is not null and not public.rate_limit_hit(v_project.organization_id, 'lead:email:' || left(v_email, 320), 5, 3600) then
    raise exception 'For mange henvendelser fra samme e-postadresse' using errcode = 'P0429';
  end if;

  insert into public.leads (
    organization_id, project_id, unit_id, page_id, name, email, phone, message,
    consent_contact, consent_similar_projects, consent_text_version, source, utm
  )
  values (
    v_project.organization_id,
    v_project.id,
    v_unit.id,
    v_page_id,
    p_lead ->> 'name',
    v_email,
    nullif(btrim(p_lead ->> 'phone'), ''),
    nullif(btrim(p_lead ->> 'message'), ''),
    coalesce((p_lead ->> 'consent_contact')::boolean, false),
    coalesce((p_lead ->> 'consent_similar_projects')::boolean, false),
    p_lead ->> 'consent_text_version',
    coalesce(nullif(p_lead ->> 'source', ''), 'site'),
    case when jsonb_typeof(p_lead -> 'utm') = 'object' then p_lead -> 'utm' else '{}'::jsonb end
  )
  returning id into v_lead_id;

  select coalesce(jsonb_agg(distinct lower(btrim(c.value ->> 'email'))), '[]'::jsonb) into v_recipients
  from jsonb_array_elements(case when jsonb_typeof(v_project.contacts) = 'array' then v_project.contacts else '[]'::jsonb end) as c(value)
  where jsonb_typeof(c.value) = 'object'
    and coalesce((c.value ->> 'receives_leads')::boolean, true)
    and (c.value ->> 'email') ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$';

  if jsonb_array_length(v_recipients) = 0 then
    select coalesce(jsonb_agg(distinct lower(pr.email)), '[]'::jsonb) into v_recipients
    from public.memberships m
    join public.profiles pr on pr.id = m.user_id
    where m.organization_id = v_project.organization_id
      and m.role in ('owner', 'admin')
      and pr.email is not null;
  end if;

  return jsonb_build_object(
    'lead_id', v_lead_id,
    'organization_id', v_project.organization_id,
    'organization_name', v_organization.name,
    'organization_slug', v_organization.slug,
    'locale', v_organization.locale,
    'project_id', v_project.id,
    'project_name', v_project.name,
    'unit_number', v_unit.unit_number,
    'recipients', v_recipients
  );
end;
$$;

grant execute on function
  public.create_site(uuid, text, jsonb, jsonb),
  public.set_home_page(uuid),
  public.reorder_pages(uuid, uuid[]),
  public.restore_page_version(uuid),
  public.get_site_publish_state(uuid),
  public.set_public_custom_fields(uuid, text[])
to authenticated;

revoke execute on function public.submit_lead(jsonb, text) from public, anon, authenticated;
grant execute on function public.submit_lead(jsonb, text) to service_role;

-- -----------------------------------------------------------------------------
-- Enhetssiden: organisasjonens navn og språk (til interesseskjemaet)
-- -----------------------------------------------------------------------------
-- Samtykketeksten nevner organisasjonen, og siden vises på organisasjonens språk.

create or replace function public.get_public_unit(p_project_id uuid, p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select app.public_unit(u, p) || jsonb_build_object(
    'description', u.description,
    'floor_plans', app.public_assets(u.organization_id, u.floor_plan_asset_ids),
    'gallery', app.public_assets(u.organization_id, u.gallery_asset_ids),
    'documents', app.public_assets(u.organization_id, u.document_asset_ids),
    'project', app.public_project(p),
    'contacts', app.public_contacts(p),
    'status_colors', app.public_status_colors(p),
    'organization', (select jsonb_build_object('name', o.name, 'locale', o.locale) from public.organizations o where o.id = p.organization_id)
  )
  from public.units u
  join public.projects p on p.id = u.project_id
  where u.project_id = p_project_id
    and u.slug = p_slug
    and not u.is_hidden
    and app.project_is_public(p.id);
$$;
