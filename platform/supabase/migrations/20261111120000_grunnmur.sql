-- =============================================================================
-- 0001 Grunnmur: skjema, standardrettigheter, typer og generelle hjelpefunksjoner
-- =============================================================================
--
-- Prinsipper for hele databasen:
--   * Alle tabeller har id (uuid), organization_id, created_at og updated_at.
--     Unntak: profiles og platform_admins hører til brukeren, ikke en organisasjon.
--   * Radnivåsikkerhet (RLS) er slått på for alle tabeller (se migrasjon 0004, *_rls.sql).
--   * anon-rollen har ingen direkte tabelltilgang. Offentlige data hentes bare
--     gjennom publiseringsfunksjonene i migrasjon 0006 (*_offentlig_api.sql).
--   * Nye funksjoner kan ikke kjøres av noen før de er gitt rettighet eksplisitt.
--   * Interne funksjoner og triggere ligger i skjemaet «app», som ikke er
--     eksponert gjennom Supabase Data API.

-- -----------------------------------------------------------------------------
-- Standardrettigheter
-- -----------------------------------------------------------------------------

-- Funksjoner skal ikke automatisk kunne kjøres av PUBLIC, anon eller authenticated.
-- Hver funksjon får rettigheter eksplisitt der den defineres.
alter default privileges for role postgres revoke execute on functions from public;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated;

-- anon skal aldri få tilgang til nye tabeller eller sekvenser i public.
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;

-- authenticated trenger bare select/insert/update/delete. RLS avgjør hvilke rader.
alter default privileges for role postgres in schema public revoke truncate, references, trigger on tables from authenticated;

-- -----------------------------------------------------------------------------
-- Internt skjema
-- -----------------------------------------------------------------------------

create schema if not exists app;
comment on schema app is 'Interne hjelpefunksjoner og triggere. Eksponeres ikke via Data API.';
revoke all on schema app from public;
grant usage on schema app to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Oppregningstyper
-- -----------------------------------------------------------------------------

create type public.member_role as enum ('owner', 'admin', 'editor', 'agent');
comment on type public.member_role is 'owner = Eier, admin = Administrator, editor = Redaktør, agent = Megler';

create type public.project_phase as enum (
  'draft', 'coming_soon', 'for_sale', 'sold_out', 'completed', 'archived'
);

create type public.unit_type as enum (
  'apartment', 'townhouse', 'detached', 'semi_detached', 'cabin', 'plot', 'commercial'
);

create type public.unit_status as enum ('upcoming', 'available', 'reserved', 'sold');
comment on type public.unit_status is 'upcoming = Kommende, available = Ledig, reserved = Reservert, sold = Solgt';

create type public.ownership_type as enum ('selveier', 'andel', 'aksje');

create type public.selector_view_kind as enum ('overview', 'facade', 'floor', 'site_plan');

create type public.hotspot_shape as enum ('polygon', 'rect');

create type public.hotspot_target_type as enum ('unit', 'view', 'project', 'url');

create type public.lead_status as enum ('new', 'contacted', 'closed');

-- Speiler Stripe sine abonnementsstatuser.
create type public.subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused'
);

-- -----------------------------------------------------------------------------
-- Generelle hjelpefunksjoner
-- -----------------------------------------------------------------------------

-- Holder updated_at oppdatert på alle tabeller som kan endres.
create function app.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Logger som ikke kan endres (unit_status_events, page_versions, audit_log).
-- Endringer avvises for alle roller, også service-rollen. Unntak:
--   * fremmednøkkel-kaskader (sletting av prosjekt eller organisasjon, eller SET NULL
--     når en enhet eller bruker slettes). Disse kjører med trigger-dybde > 1.
--   * planlagt vedlikehold som eksplisitt slår på app.maintenance i sin egen transaksjon.
create function app.enforce_append_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if pg_trigger_depth() > 1 or current_setting('app.maintenance', true) = 'on' then
    return case when tg_op = 'DELETE' then old else new end;
  end if;
  raise exception '% kan ikke endres eller slettes', tg_table_name
    using errcode = '42501';
end;
$$;

-- Lager en URL-vennlig slug: «Leilighet A-302 Æ» -> «leilighet-a-302-ae».
create function app.slugify(p_value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select nullif(
    trim(both '-' from left(
      trim(both '-' from regexp_replace(
        translate(
          replace(replace(lower(p_value), 'æ', 'ae'), 'ß', 'ss'),
          'øåäöüéèêëáàâíìîóòôúùûýñç',
          'oaaoueeeeaaaiiiooouuuync'
        ),
        '[^a-z0-9]+', '-', 'g'
      )),
      80
    )),
    ''
  );
$$;

-- Trygg konvertering av tekst til uuid (brukes på filstier i Storage).
create function app.try_uuid(p_value text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return p_value::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

-- Om et abonnement tillater endringer. Ellers er organisasjonen i lesemodus.
create function app.subscription_allows_writes(
  p_status public.subscription_status,
  p_trial_ends_at timestamptz
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select case p_status
    when 'active' then true
    when 'past_due' then true  -- Stripe prøver fortsatt å trekke betalingen
    when 'trialing' then p_trial_ends_at is null or p_trial_ends_at > now()
    else false
  end;
$$;

-- Validerer koordinatene til en markering. Alle punkter er [x, y] som andeler
-- (0–1) av bildets bredde og høyde. Et rektangel lagres som to hjørner:
-- øverst til venstre og nederst til høyre.
create function app.valid_hotspot_points(p_shape public.hotspot_shape, p_points jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_point jsonb;
  v_count integer;
begin
  if p_points is null or jsonb_typeof(p_points) <> 'array' then
    return false;
  end if;

  v_count := jsonb_array_length(p_points);
  if p_shape = 'rect' and v_count <> 2 then
    return false;
  end if;
  if p_shape = 'polygon' and (v_count < 3 or v_count > 1000) then
    return false;
  end if;

  for v_point in select value from jsonb_array_elements(p_points) loop
    if jsonb_typeof(v_point) <> 'array'
       or jsonb_array_length(v_point) <> 2
       or jsonb_typeof(v_point -> 0) <> 'number'
       or jsonb_typeof(v_point -> 1) <> 'number'
       or (v_point ->> 0)::numeric not between 0 and 1
       or (v_point ->> 1)::numeric not between 0 and 1 then
      return false;
    end if;
  end loop;

  if p_shape = 'rect' and (
       (p_points -> 1 ->> 0)::numeric <= (p_points -> 0 ->> 0)::numeric
    or (p_points -> 1 ->> 1)::numeric <= (p_points -> 0 ->> 1)::numeric
  ) then
    return false;
  end if;

  return true;
end;
$$;

-- Underdomener som er reservert for plattformen selv.
create function app.is_reserved_subdomain(p_value text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_value = any (array[
    'app', 'www', 'api', 'admin', 'auth', 'login', 'mail', 'smtp', 'static', 'assets',
    'cdn', 'media', 'embed', 'docs', 'help', 'support', 'status', 'blog', 'dev', 'staging',
    'test', 'preview', 'demo', 'platform', 'plattform', 'dashboard', 'billing', 'webhooks'
  ]);
$$;

-- Sidestier som brukes av plattformen på publiserte prosjektsider.
create function app.is_reserved_page_slug(p_value text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_value = any (array[
    'bolig', 'personvern', 'informasjonskapsler', 'api', 'embed', 'preview',
    'sitemap-xml', 'robots-txt', 'favoritter', 'sammenlign'
  ]);
$$;

-- Funksjonene over brukes i CHECK-regler og standardverdier, og må derfor
-- kunne kjøres av rollene som skriver data.
grant execute on function
  app.slugify(text),
  app.try_uuid(text),
  app.subscription_allows_writes(public.subscription_status, timestamptz),
  app.valid_hotspot_points(public.hotspot_shape, jsonb),
  app.is_reserved_subdomain(text),
  app.is_reserved_page_slug(text)
to authenticated, service_role;
