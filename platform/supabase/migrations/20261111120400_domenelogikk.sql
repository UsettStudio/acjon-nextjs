-- =============================================================================
-- 0005 Domenelogikk: triggere og funksjoner for innloggede brukere
-- =============================================================================

-- -----------------------------------------------------------------------------
-- updated_at, uforanderlige logger og uforanderlige nøkkelkolonner
-- -----------------------------------------------------------------------------

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'organizations', 'profiles', 'platform_admins', 'memberships', 'invitations', 'projects',
    'project_members', 'assets', 'stages', 'buildings', 'units', 'selectors', 'selector_views',
    'hotspots', 'sites', 'pages', 'domains', 'leads', 'api_keys', 'webhooks',
    'webhook_deliveries', 'rate_limit_buckets'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function app.set_updated_at()',
      v_table
    );
  end loop;

  foreach v_table in array array['unit_status_events', 'page_versions', 'audit_log'] loop
    execute format(
      'create trigger enforce_append_only before update or delete on public.%I
         for each row execute function app.enforce_append_only()',
      v_table
    );
  end loop;
end;
$$;

-- Nøkkelkolonner (id, organisasjon, prosjekt og forelder) kan ikke endres etter at
-- raden er opprettet. Dermed kan ingen flytte data mellom organisasjoner eller
-- prosjekter, selv om de har skrivetilgang i begge.
create function app.prevent_column_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_column text;
  v_old jsonb := to_jsonb(old);
  v_new jsonb := to_jsonb(new);
begin
  foreach v_column in array tg_argv loop
    if (v_new -> v_column) is distinct from (v_old -> v_column) then
      raise exception '%.% kan ikke endres', tg_table_name, v_column
        using errcode = '42501';
    end if;
  end loop;
  return new;
end;
$$;

create trigger prevent_key_changes before update on public.organizations
  for each row execute function app.prevent_column_changes('id');
create trigger prevent_key_changes before update on public.profiles
  for each row execute function app.prevent_column_changes('id');
create trigger prevent_key_changes before update on public.platform_admins
  for each row execute function app.prevent_column_changes('id', 'user_id');
create trigger prevent_key_changes before update on public.memberships
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'user_id');
create trigger prevent_key_changes before update on public.invitations
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'email');
create trigger prevent_key_changes before update on public.projects
  for each row execute function app.prevent_column_changes('id', 'organization_id');
create trigger prevent_key_changes before update on public.project_members
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id', 'user_id');
create trigger prevent_key_changes before update on public.assets
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'storage_path', 'mime', 'bytes');
create trigger prevent_key_changes before update on public.stages
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id');
create trigger prevent_key_changes before update on public.buildings
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id');
create trigger prevent_key_changes before update on public.units
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id');
create trigger prevent_key_changes before update on public.selectors
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id');
create trigger prevent_key_changes before update on public.selector_views
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id', 'selector_id');
create trigger prevent_key_changes before update on public.hotspots
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id', 'view_id');
create trigger prevent_key_changes before update on public.sites
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id');
create trigger prevent_key_changes before update on public.pages
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id', 'site_id');
create trigger prevent_key_changes before update on public.domains
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id', 'site_id', 'hostname');
create trigger prevent_key_changes before update on public.leads
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id');
create trigger prevent_key_changes before update on public.api_keys
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'key_hash');
create trigger prevent_key_changes before update on public.webhooks
  for each row execute function app.prevent_column_changes('id', 'organization_id');
create trigger prevent_key_changes before update on public.webhook_deliveries
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'webhook_id');
create trigger prevent_key_changes before update on public.rate_limit_buckets
  for each row execute function app.prevent_column_changes('id', 'organization_id');

-- -----------------------------------------------------------------------------
-- Revisjonslogg
-- -----------------------------------------------------------------------------

create function app.write_audit(
  p_organization_id uuid,
  p_project_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_claims jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  v_actor_type text := 'system';
begin
  if v_actor is not null then
    v_actor_type := case
      when app.is_platform_admin() and not exists (
        select 1 from public.memberships m
        where m.organization_id = p_organization_id and m.user_id = v_actor
      ) then 'platform_admin'
      else 'user'
    end;
  end if;

  insert into public.audit_log (
    organization_id, project_id, actor_id, actor_email, actor_type,
    action, entity_type, entity_id, data
  )
  values (
    p_organization_id, p_project_id, v_actor, v_claims ->> 'email', v_actor_type,
    p_action, p_entity_type, p_entity_id, coalesce(p_data, '{}'::jsonb)
  );
end;
$$;

-- Generisk revisjonstrigger. Første argument er entitetsnavnet, resten er
-- kolonnene som skal logges. Kolonner som ikke er listet (hemmeligheter,
-- hasher, personopplysninger) kommer aldri i loggen.
create function app.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row jsonb := to_jsonb(case when tg_op = 'DELETE' then old else new end);
  v_old jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) end;
  v_data jsonb := '{}'::jsonb;
  v_changed boolean := tg_op <> 'UPDATE';
  v_column text;
  v_reason text := nullif(current_setting('app.audit_reason', true), '');
begin
  -- Kaskader (sletting av organisasjon, prosjekt eller bruker) logges ikke rad for rad.
  if pg_trigger_depth() > 1 then
    return null;
  end if;

  for i in 1 .. tg_nargs - 1 loop
    v_column := tg_argv[i];
    v_data := v_data || jsonb_build_object(v_column, v_row -> v_column);
    if tg_op = 'UPDATE' and (v_old -> v_column) is distinct from (v_row -> v_column) then
      v_changed := true;
      v_data := v_data || jsonb_build_object('previous_' || v_column, v_old -> v_column);
    end if;
  end loop;

  if not v_changed then
    return null;
  end if;

  if v_reason is not null then
    v_data := v_data || jsonb_build_object('reason', v_reason);
  end if;

  perform app.write_audit(
    (v_row ->> 'organization_id')::uuid,
    (v_row ->> 'project_id')::uuid,
    tg_argv[0] || '.' || case tg_op when 'INSERT' then 'created' when 'UPDATE' then 'updated' else 'deleted' end,
    tg_argv[0],
    (v_row ->> 'id')::uuid,
    v_data
  );
  return null;
end;
$$;

create trigger audit_change after insert or update or delete on public.memberships
  for each row execute function app.audit_row_change('membership', 'user_id', 'role');
create trigger audit_change after insert or update or delete on public.invitations
  for each row execute function app.audit_row_change('invitation', 'email', 'role', 'project_ids', 'accepted_at', 'revoked_at');
create trigger audit_change after insert or delete on public.project_members
  for each row execute function app.audit_row_change('project_member', 'user_id');
create trigger audit_change after insert or delete on public.projects
  for each row execute function app.audit_row_change('project', 'name', 'slug');
create trigger audit_change after delete on public.units
  for each row execute function app.audit_row_change('unit', 'unit_number');
create trigger audit_change after insert or update or delete on public.api_keys
  for each row execute function app.audit_row_change('api_key', 'name', 'key_prefix', 'scopes', 'revoked_at');
create trigger audit_change after insert or update or delete on public.webhooks
  for each row execute function app.audit_row_change('webhook', 'url', 'events', 'is_active');
create trigger audit_change after insert or update or delete on public.domains
  for each row execute function app.audit_row_change('domain', 'hostname', 'is_primary', 'verified_at');
-- Sletting av leads logges uten personopplysninger (dokumenterer GDPR-sletting).
create trigger audit_change after delete on public.leads
  for each row execute function app.audit_row_change('lead');

-- -----------------------------------------------------------------------------
-- Profiler fra auth.users
-- -----------------------------------------------------------------------------

create function app.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.profiles (id, email, full_name)
    values (
      new.id,
      new.email,
      left(nullif(btrim(coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      )), ''), 200)
    )
    on conflict (id) do nothing;
  elsif new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger app_sync_profile_after_insert after insert on auth.users
  for each row execute function app.sync_profile_from_auth();
create trigger app_sync_profile_after_email_change after update of email on auth.users
  for each row execute function app.sync_profile_from_auth();

-- -----------------------------------------------------------------------------
-- Organisasjoner og medlemskap
-- -----------------------------------------------------------------------------

create function app.validate_organization_logo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.logo_asset_id is not null
     and (tg_op = 'INSERT' or new.logo_asset_id is distinct from old.logo_asset_id)
     and not exists (
       select 1 from public.assets a
       where a.id = new.logo_asset_id and a.organization_id = new.id and a.mime like 'image/%'
     ) then
    raise exception 'Logoen må være et bilde i organisasjonens eget mediebibliotek'
      using errcode = '23503';
  end if;
  return new;
end;
$$;

create trigger validate_logo before insert or update of logo_asset_id on public.organizations
  for each row execute function app.validate_organization_logo();

-- En organisasjon skal alltid ha minst én eier.
create function app.protect_last_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Kaskader fra sletting av organisasjonen eller brukeren skal ikke stoppes.
  if pg_trigger_depth() > 1 then
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  if old.role = 'owner' and (tg_op = 'DELETE' or new.role <> 'owner') then
    -- Lås organisasjonen så to eiere ikke kan fjerne hverandre samtidig.
    perform 1 from public.organizations o where o.id = old.organization_id for update;
    if not exists (
      select 1 from public.memberships m
      where m.organization_id = old.organization_id and m.role = 'owner' and m.id <> old.id
    ) then
      raise exception 'Organisasjonen må ha minst én eier' using errcode = '23514';
    end if;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger protect_last_owner before delete or update of role on public.memberships
  for each row execute function app.protect_last_owner();

create function app.validate_invitation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from unnest(new.project_ids) as ids(id)
    where not exists (
      select 1 from public.projects p
      where p.id = ids.id and p.organization_id = new.organization_id
    )
  ) then
    raise exception 'Invitasjonen kan bare gi tilgang til prosjekter i organisasjonen'
      using errcode = '23503';
  end if;
  return new;
end;
$$;

create trigger validate_invitation before insert or update of project_ids on public.invitations
  for each row execute function app.validate_invitation();

-- Oppretter organisasjon med innlogget bruker som eier. 30 dagers prøveperiode uten kort.
create function public.create_organization(p_name text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_claims jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  v_organization_id uuid;
begin
  if v_user is null or coalesce((v_claims ->> 'is_anonymous')::boolean, false) then
    raise exception 'Du må være innlogget for å opprette en organisasjon' using errcode = '42501';
  end if;

  insert into public.organizations (name, slug)
  values (btrim(p_name), p_slug)
  returning id into v_organization_id;

  insert into public.memberships (organization_id, user_id, role)
  values (v_organization_id, v_user, 'owner');

  perform app.write_audit(
    v_organization_id, null, 'organization.created', 'organization', v_organization_id,
    jsonb_build_object('name', btrim(p_name), 'slug', p_slug)
  );
  return v_organization_id;
end;
$$;

-- Godtar en invitasjon. Krever at innlogget bruker har bekreftet samme e-postadresse.
create function public.accept_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_email text;
  v_confirmed boolean;
  v_invitation public.invitations;
begin
  if v_user is null then
    raise exception 'Du må være innlogget for å godta invitasjonen' using errcode = '42501';
  end if;

  select lower(u.email), u.email_confirmed_at is not null
    into v_email, v_confirmed
  from auth.users u
  where u.id = v_user;

  select * into v_invitation
  from public.invitations i
  where i.token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex')
  for update;

  if not found
     or v_invitation.accepted_at is not null
     or v_invitation.revoked_at is not null
     or v_invitation.expires_at <= now() then
    raise exception 'Invitasjonen er ugyldig eller utløpt' using errcode = 'P0002';
  end if;

  if v_invitation.email is distinct from v_email or not v_confirmed then
    raise exception 'Invitasjonen gjelder en annen e-postadresse' using errcode = '42501';
  end if;

  -- Er brukeren allerede medlem, beholdes rollen. Prosjekttilgang legges til.
  insert into public.memberships (organization_id, user_id, role)
  values (v_invitation.organization_id, v_user, v_invitation.role)
  on conflict (organization_id, user_id) do nothing;

  insert into public.project_members (organization_id, project_id, user_id)
  select v_invitation.organization_id, p.id, v_user
  from public.projects p
  where p.organization_id = v_invitation.organization_id
    and p.id = any (v_invitation.project_ids)
  on conflict do nothing;

  update public.invitations
     set accepted_at = now(), accepted_by = v_user
   where id = v_invitation.id;

  return v_invitation.organization_id;
end;
$$;

-- Kalles av appen etter vellykket innlogging. Logges i hver organisasjon brukeren er med i.
create function public.record_login()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_organization_id uuid;
begin
  if v_user is null then
    raise exception 'Ikke innlogget' using errcode = '42501';
  end if;
  for v_organization_id in
    select m.organization_id from public.memberships m where m.user_id = v_user
  loop
    perform app.write_audit(v_organization_id, null, 'auth.login', 'user', v_user, '{}'::jsonb);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Enheter og statuslogg
-- -----------------------------------------------------------------------------

create function app.units_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  -- Feltene en megler kan endre.
  v_sales_columns constant text[] := array[
    'status', 'price', 'purchase_costs', 'shared_debt', 'monthly_fee', 'updated_at'
  ];
begin
  if new.slug is null or new.slug = '' then
    new.slug := coalesce(app.slugify(new.unit_number), 'enhet');
  end if;

  if (tg_op = 'INSERT'
      or new.floor_plan_asset_ids is distinct from old.floor_plan_asset_ids
      or new.gallery_asset_ids is distinct from old.gallery_asset_ids
      or new.document_asset_ids is distinct from old.document_asset_ids)
     and exists (
       select 1
       from unnest(new.floor_plan_asset_ids || new.gallery_asset_ids || new.document_asset_ids) as ids(id)
       where not exists (
         select 1 from public.assets a
         where a.id = ids.id and a.organization_id = new.organization_id
       )
     ) then
    raise exception 'Filer på en enhet må ligge i organisasjonens mediebibliotek'
      using errcode = '23503';
  end if;

  -- Megler uten innholdsrolle i prosjektet kan bare endre status og pris.
  -- Gjelder direkte endringer (trigger-dybde 1), ikke interne kaskader.
  if tg_op = 'UPDATE'
     and pg_trigger_depth() = 1
     and (select auth.uid()) is not null
     and (to_jsonb(new) - v_sales_columns) is distinct from (to_jsonb(old) - v_sales_columns)
     and not app.has_project_role(new.project_id, app.roles_content(), true) then
    raise exception 'Meglere kan bare endre status og pris' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger units_before_write before insert or update on public.units
  for each row execute function app.units_before_write();

-- Hver statusendring logges med bruker, tidspunkt, kilde og valgfritt notat.
-- Notat og kilde sendes inn via set_unit_status() som transaksjonslokale innstillinger.
create function app.log_unit_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
begin
  insert into public.unit_status_events (
    organization_id, project_id, unit_id, unit_number, from_status, to_status, changed_by, note, source
  )
  values (
    new.organization_id, new.project_id, new.id, new.unit_number, old.status, new.status, v_actor,
    nullif(current_setting('app.status_note', true), ''),
    coalesce(
      nullif(current_setting('app.status_source', true), ''),
      case when v_actor is null then 'system' else 'admin' end
    )
  );
  return null;
end;
$$;

create trigger log_unit_status_change after update of status on public.units
  for each row when (old.status is distinct from new.status)
  execute function app.log_unit_status_change();

-- Webhook-utboks: én leveranse per aktiv webhook som abonnerer på hendelsen.
create function app.enqueue_webhooks(
  p_organization_id uuid,
  p_project_id uuid,
  p_event text,
  p_data jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payload jsonb := jsonb_build_object(
    'id', gen_random_uuid(),
    'type', p_event,
    'created_at', now(),
    'data', p_data
  );
begin
  insert into public.webhook_deliveries (organization_id, webhook_id, event, payload)
  select w.organization_id, w.id, p_event, v_payload
  from public.webhooks w
  where w.organization_id = p_organization_id
    and w.is_active
    and p_event = any (w.events)
    and (w.project_ids is null or p_project_id = any (w.project_ids));
end;
$$;

-- Sanntid for publiserte boligvelgere: kringkaster til en offentlig kanal per
-- prosjekt. Innholdet er bare enhets-id og status, aldri interne felt.
-- Er best effort: en feil her stopper aldri selve statusendringen.
create function app.broadcast_unit_status(
  p_project_id uuid,
  p_unit_id uuid,
  p_status public.unit_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_unit_id is null
     or to_regprocedure('realtime.send(jsonb, text, text, boolean)') is null
     or not app.project_is_public(p_project_id)
     or exists (select 1 from public.units u where u.id = p_unit_id and u.is_hidden) then
    return;
  end if;

  perform realtime.send(
    jsonb_build_object('unit_id', p_unit_id, 'status', p_status, 'changed_at', now()),
    'unit_status',
    'project:' || p_project_id::text || ':units',
    false
  );
exception when others then
  raise warning 'Statusendringen er lagret, men kunne ikke kringkastes: %', sqlerrm;
end;
$$;

create function app.publish_unit_status_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app.write_audit(
    new.organization_id, new.project_id, 'unit.status_changed', 'unit', new.unit_id,
    jsonb_build_object(
      'unit_number', new.unit_number, 'from', new.from_status, 'to', new.to_status,
      'note', new.note, 'source', new.source
    )
  );
  perform app.enqueue_webhooks(
    new.organization_id, new.project_id, 'unit.status_changed',
    jsonb_build_object(
      'unit_id', new.unit_id, 'unit_number', new.unit_number, 'project_id', new.project_id,
      'from_status', new.from_status, 'to_status', new.to_status, 'changed_at', new.created_at
    )
  );
  perform app.broadcast_unit_status(new.project_id, new.unit_id, new.to_status);
  return null;
end;
$$;

create trigger publish_unit_status_event after insert on public.unit_status_events
  for each row execute function app.publish_unit_status_event();

-- Setter status på én eller flere enheter. Brukes av enhetstabellen, enhetsskjemaet
-- og Status-modus i boligvelgeren. Kjører med innlogget brukers rettigheter (RLS).
create function public.set_unit_status(
  p_unit_ids uuid[],
  p_status public.unit_status,
  p_note text default null,
  p_source text default 'admin'
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_requested integer;
  v_allowed integer;
  v_changed integer;
begin
  if p_source is null or p_source not in ('admin', 'table', 'form', 'selector', 'import', 'api') then
    raise exception 'Ukjent kilde for statusendring: %', p_source using errcode = '22023';
  end if;

  select count(distinct id) into v_requested from unnest(p_unit_ids) as ids(id);

  select count(*) into v_allowed
  from public.units u
  where u.id = any (p_unit_ids)
    and u.project_id in (select app.project_ids_with_role(app.roles_sales(), true));

  if v_requested = 0 or v_allowed <> v_requested then
    raise exception 'Mangler tilgang til å endre status på en eller flere enheter'
      using errcode = '42501';
  end if;

  perform set_config('app.status_note', coalesce(btrim(p_note), ''), true);
  perform set_config('app.status_source', p_source, true);

  update public.units
     set status = p_status
   where id = any (p_unit_ids)
     and status is distinct from p_status;
  get diagnostics v_changed = row_count;

  perform set_config('app.status_note', '', true);
  perform set_config('app.status_source', '', true);
  return v_changed;
end;
$$;

-- -----------------------------------------------------------------------------
-- Leads
-- -----------------------------------------------------------------------------

create function app.leads_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.name := btrim(new.name);
  new.email := lower(btrim(new.email));
  if new.unit_id is not null then
    select u.unit_number into new.unit_number from public.units u where u.id = new.unit_id;
  end if;
  return new;
end;
$$;

create trigger leads_before_insert before insert on public.leads
  for each row execute function app.leads_before_insert();

create function app.leads_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app.enqueue_webhooks(
    new.organization_id, new.project_id, 'lead.created',
    jsonb_build_object(
      'lead_id', new.id, 'project_id', new.project_id, 'unit_id', new.unit_id,
      'unit_number', new.unit_number, 'name', new.name, 'email', new.email, 'phone', new.phone,
      'message', new.message, 'consent_contact', new.consent_contact,
      'consent_similar_projects', new.consent_similar_projects,
      'consent_text_version', new.consent_text_version, 'consented_at', new.consented_at,
      'source', new.source, 'utm', new.utm, 'created_at', new.created_at
    )
  );
  return null;
end;
$$;

create trigger leads_after_insert after insert on public.leads
  for each row execute function app.leads_after_insert();

-- -----------------------------------------------------------------------------
-- Mediebibliotek
-- -----------------------------------------------------------------------------

-- Når en fil slettes, fjernes den fra enhetenes plantegninger, galleri og dokumenter.
create function app.remove_deleted_asset_references()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if pg_trigger_depth() > 1 then
    return null;  -- hele organisasjonen slettes
  end if;
  update public.units u
     set floor_plan_asset_ids = array_remove(u.floor_plan_asset_ids, old.id),
         gallery_asset_ids = array_remove(u.gallery_asset_ids, old.id),
         document_asset_ids = array_remove(u.document_asset_ids, old.id)
   where u.organization_id = old.organization_id
     and old.id = any (u.floor_plan_asset_ids || u.gallery_asset_ids || u.document_asset_ids);
  return null;
end;
$$;

create trigger remove_deleted_asset_references after delete on public.assets
  for each row execute function app.remove_deleted_asset_references();

-- -----------------------------------------------------------------------------
-- Boligvelger
-- -----------------------------------------------------------------------------

create function app.validate_selector_view()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_view_id is not null then
    if not exists (
      select 1 from public.selector_views p
      where p.id = new.parent_view_id and p.selector_id = new.selector_id
    ) then
      raise exception 'Overordnet visning må tilhøre samme boligvelger' using errcode = '23503';
    end if;

    if tg_op = 'UPDATE' and exists (
      with recursive ancestors (id) as (
        select new.parent_view_id
        union
        select v.parent_view_id
        from public.selector_views v
        join ancestors a on v.id = a.id
        where v.parent_view_id is not null
      )
      select 1 from ancestors where ancestors.id = new.id
    ) then
      raise exception 'En visning kan ikke ligge under seg selv' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create trigger validate_selector_view before insert or update of parent_view_id on public.selector_views
  for each row execute function app.validate_selector_view();

create function app.validate_selector_entry_view()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.entry_view_id is not null and not exists (
    select 1 from public.selector_views v
    where v.id = new.entry_view_id and v.selector_id = new.id
  ) then
    raise exception 'Startvisningen må tilhøre boligvelgeren' using errcode = '23503';
  end if;
  return new;
end;
$$;

create trigger validate_entry_view before insert or update of entry_view_id on public.selectors
  for each row execute function app.validate_selector_entry_view();

create function app.validate_hotspot()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.target_view_id is not null and not exists (
    select 1
    from public.selector_views target
    join public.selector_views own on own.selector_id = target.selector_id
    where target.id = new.target_view_id and own.id = new.view_id
  ) then
    raise exception 'En markering kan bare lenke til visninger i samme boligvelger' using errcode = '23503';
  end if;
  return new;
end;
$$;

create trigger validate_hotspot before insert or update of target_view_id on public.hotspots
  for each row execute function app.validate_hotspot();

-- Bygger øyeblikksbildet som publiseres: visninger med bilde og markeringer.
-- Inneholder aldri status eller farge. Ukoblede markeringer tas ikke med.
create function app.build_selector_snapshot(p_selector_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'schema_version', 1,
    'selector_id', s.id,
    'name', s.name,
    'settings', s.settings,
    'entry_view_id', coalesce(
      s.entry_view_id,
      (select v.id from public.selector_views v
       where v.selector_id = s.id and v.parent_view_id is null
       order by v.sort_order, v.created_at
       limit 1)
    ),
    'views', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', v.id,
          'parent_view_id', v.parent_view_id,
          'name', v.name,
          'kind', v.kind,
          'angle_group', v.angle_group,
          'sort_order', v.sort_order,
          'image_width', v.image_width,
          'image_height', v.image_height,
          'asset', case when a.id is null then null else jsonb_build_object(
            'id', a.id, 'path', a.storage_path, 'mime', a.mime, 'width', a.width,
            'height', a.height, 'alt', a.alt_text, 'variants', a.variants
          ) end,
          'hotspots', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', h.id,
                'shape', h.shape,
                'points', h.points,
                'target_type', h.target_type,
                'target_unit_id', h.target_unit_id,
                'target_view_id', h.target_view_id,
                'target_project_id', h.target_project_id,
                'target_url', h.target_url,
                'label', h.label
              )
              order by h.sort_order, h.created_at
            )
            from public.hotspots h
            where h.view_id = v.id
              and h.target_type is not null
              and (h.target_type <> 'view' or h.target_view_id is not null)
              and (h.target_type <> 'project' or h.target_project_id is not null)
          ), '[]'::jsonb)
        )
        order by v.sort_order, v.created_at
      )
      from public.selector_views v
      left join public.assets a on a.id = v.asset_id and a.organization_id = v.organization_id
      where v.selector_id = s.id
    ), '[]'::jsonb)
  )
  from public.selectors s
  where s.id = p_selector_id;
$$;

-- Publiserer former og koblinger. Statusendringer trenger ikke publisering.
create function public.publish_selector(p_selector_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_selector public.selectors;
  v_snapshot jsonb;
  v_now timestamptz := now();
begin
  select * into v_selector from public.selectors s where s.id = p_selector_id for update;
  if not found or not app.has_project_role(v_selector.project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til å publisere boligvelgeren' using errcode = '42501';
  end if;

  v_snapshot := app.build_selector_snapshot(v_selector.id);
  if jsonb_array_length(v_snapshot -> 'views') = 0 then
    raise exception 'Boligvelgeren må ha minst én visning før den kan publiseres' using errcode = '23514';
  end if;

  update public.selectors
     set published_snapshot = v_snapshot, published_at = v_now
   where id = v_selector.id;

  perform app.write_audit(
    v_selector.organization_id, v_selector.project_id, 'selector.published', 'selector', v_selector.id,
    jsonb_build_object('views', jsonb_array_length(v_snapshot -> 'views'))
  );
  return v_now;
end;
$$;

create function public.unpublish_selector(p_selector_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_selector public.selectors;
begin
  select * into v_selector from public.selectors s where s.id = p_selector_id for update;
  if not found or not app.has_project_role(v_selector.project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til å avpublisere boligvelgeren' using errcode = '42501';
  end if;

  update public.selectors set published_snapshot = null, published_at = null where id = v_selector.id;
  perform app.write_audit(
    v_selector.organization_id, v_selector.project_id, 'selector.unpublished', 'selector', v_selector.id, '{}'::jsonb
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Prosjektsider
-- -----------------------------------------------------------------------------

-- Skjulte blokker beholder innholdet i utkastet, men publiseres ikke.
create function app.visible_blocks(p_blocks jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(jsonb_agg(b.block order by b.ord), '[]'::jsonb)
  from jsonb_array_elements(coalesce(p_blocks, '[]'::jsonb)) with ordinality as b(block, ord)
  where coalesce((b.block ->> 'hidden')::boolean, false) = false;
$$;

-- Publiserer prosjektsiden: meny, bunntekst, tema og alle sider som er endret.
-- Hver publisert endring blir en ny versjon i page_versions.
create function public.publish_site(p_site_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_site public.sites;
  v_page public.pages;
  v_home_page_id uuid;
  v_blocks jsonb;
  v_meta jsonb;
  v_version integer;
  v_published integer := 0;
  v_now timestamptz := now();
begin
  select * into v_site from public.sites s where s.id = p_site_id for update;
  if not found or not app.has_project_role(v_site.project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til å publisere prosjektsiden' using errcode = '42501';
  end if;

  select p.id into v_home_page_id from public.pages p where p.site_id = v_site.id and p.is_home;
  if v_home_page_id is null then
    raise exception 'Prosjektsiden må ha en forside før den kan publiseres' using errcode = '23514';
  end if;

  for v_page in
    select * from public.pages p where p.site_id = v_site.id order by p.sort_order for update
  loop
    v_blocks := app.visible_blocks(v_page.draft_blocks);
    v_meta := jsonb_build_object(
      'title', v_page.title,
      'seo_title', v_page.seo_title,
      'seo_description', v_page.seo_description,
      'og_asset_id', v_page.og_asset_id
    );

    if v_page.published_at is null
       or v_page.published_blocks is distinct from v_blocks
       or v_page.published_slug is distinct from v_page.slug
       or v_page.published_meta is distinct from v_meta then
      select coalesce(max(pv.version), 0) + 1 into v_version
      from public.page_versions pv where pv.page_id = v_page.id;

      -- Versjonen lagrer hele utkastet, også skjulte blokker, så det kan gjenopprettes.
      insert into public.page_versions (organization_id, project_id, page_id, version, blocks, meta, created_by)
      values (
        v_page.organization_id, v_page.project_id, v_page.id, v_version, v_page.draft_blocks,
        v_meta || jsonb_build_object('slug', v_page.slug), (select auth.uid())
      );

      update public.pages
         set published_blocks = v_blocks,
             published_slug = v_page.slug,
             published_meta = v_meta,
             published_at = v_now
       where id = v_page.id;
      v_published := v_published + 1;
    end if;
  end loop;

  update public.sites
     set published_config = jsonb_build_object(
           'theme', theme,
           'nav', nav,
           'footer', footer,
           'seo_defaults', seo_defaults,
           'cookie_settings', cookie_settings,
           'home_page_id', v_home_page_id
         ),
         published_at = v_now
   where id = v_site.id;

  perform app.write_audit(
    v_site.organization_id, v_site.project_id, 'site.published', 'site', v_site.id,
    jsonb_build_object('pages_published', v_published)
  );
  return v_now;
end;
$$;

create function public.unpublish_site(p_site_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_site public.sites;
begin
  select * into v_site from public.sites s where s.id = p_site_id for update;
  if not found or not app.has_project_role(v_site.project_id, app.roles_content(), true) then
    raise exception 'Mangler tilgang til å avpublisere prosjektsiden' using errcode = '42501';
  end if;

  update public.sites set published_config = null, published_at = null where id = v_site.id;
  perform app.write_audit(
    v_site.organization_id, v_site.project_id, 'site.unpublished', 'site', v_site.id, '{}'::jsonb
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Funksjoner som bare service-rollen (serveren og planlagte jobber) kan kjøre
-- -----------------------------------------------------------------------------

-- Daglig vedlikehold: lagringstid for leads, gamle webhook-leveranser og rate limit.
create function app.run_daily_maintenance()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_leads integer;
  v_deliveries integer;
  v_buckets integer;
begin
  perform set_config('app.audit_reason', 'retention', true);
  delete from public.leads l
  using public.organizations o
  where o.id = l.organization_id
    and o.lead_retention_days is not null
    and l.created_at < now() - make_interval(days => o.lead_retention_days);
  get diagnostics v_leads = row_count;
  perform set_config('app.audit_reason', '', true);

  delete from public.webhook_deliveries
  where status <> 'pending' and created_at < now() - interval '30 days';
  get diagnostics v_deliveries = row_count;

  delete from public.rate_limit_buckets where window_start < now() - interval '1 day';
  get diagnostics v_buckets = row_count;

  return jsonb_build_object(
    'leads_deleted', v_leads,
    'webhook_deliveries_deleted', v_deliveries,
    'rate_limit_buckets_deleted', v_buckets
  );
end;
$$;

-- Fast tidsvindu. Returnerer false når grensen er nådd.
create function public.rate_limit_hit(
  p_organization_id uuid,
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_start timestamptz :=
    to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  insert into public.rate_limit_buckets as b (organization_id, key, window_start, hits)
  values (p_organization_id, p_key, v_window_start, 1)
  on conflict (organization_id, key, window_start) do update set hits = b.hits + 1
  returning b.hits into v_hits;
  return v_hits <= p_limit;
end;
$$;

-- Henter leveranser som skal sendes nå. Låser dem i ti minutter mens de sendes.
create function public.claim_webhook_deliveries(p_limit integer default 25)
returns table (
  delivery_id uuid,
  webhook_id uuid,
  url text,
  secret text,
  event text,
  payload jsonb,
  attempt integer
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with due as (
    select d.id
    from public.webhook_deliveries d
    where d.status = 'pending' and d.next_attempt_at <= now()
    order by d.next_attempt_at
    limit greatest(1, least(coalesce(p_limit, 25), 100))
    for update skip locked
  ),
  claimed as (
    update public.webhook_deliveries d
       set attempts = d.attempts + 1,
           next_attempt_at = now() + interval '10 minutes'
      from due
     where d.id = due.id
    returning d.id, d.webhook_id, d.event, d.payload, d.attempts
  )
  select c.id, c.webhook_id, w.url, w.secret, c.event, c.payload, c.attempts
  from claimed c
  join public.webhooks w on w.id = c.webhook_id;
end;
$$;

-- Registrerer resultatet. Nye forsøk med eksponentiell ventetid, maks åtte forsøk.
create function public.complete_webhook_delivery(
  p_delivery_id uuid,
  p_succeeded boolean,
  p_response_status integer default null,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_delivery public.webhook_deliveries;
begin
  select * into v_delivery from public.webhook_deliveries d where d.id = p_delivery_id for update;
  if not found then
    return;
  end if;

  if p_succeeded then
    update public.webhook_deliveries
       set status = 'succeeded', delivered_at = now(),
           last_response_status = p_response_status, last_error = null
     where id = p_delivery_id;
    update public.webhooks set last_success_at = now(), failure_count = 0 where id = v_delivery.webhook_id;
  else
    update public.webhook_deliveries
       set status = case when v_delivery.attempts >= 8 then 'failed' else 'pending' end,
           next_attempt_at = now() + least(
             interval '6 hours',
             make_interval(mins => power(2, greatest(v_delivery.attempts - 1, 0))::integer)
           ),
           last_response_status = p_response_status,
           last_error = left(p_error, 2000)
     where id = p_delivery_id;
    update public.webhooks
       set last_failure_at = now(), failure_count = failure_count + 1
     where id = v_delivery.webhook_id;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Rettigheter for funksjonene i denne filen
-- -----------------------------------------------------------------------------

grant execute on function
  public.create_organization(text, text),
  public.accept_invitation(text),
  public.record_login(),
  public.set_unit_status(uuid[], public.unit_status, text, text),
  public.publish_selector(uuid),
  public.unpublish_selector(uuid),
  public.publish_site(uuid),
  public.unpublish_site(uuid)
to authenticated;

grant execute on function
  public.rate_limit_hit(uuid, text, integer, integer),
  public.claim_webhook_deliveries(integer),
  public.complete_webhook_delivery(uuid, boolean, integer, text),
  app.run_daily_maintenance()
to service_role;
