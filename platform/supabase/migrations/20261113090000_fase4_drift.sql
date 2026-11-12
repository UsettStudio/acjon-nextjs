-- =============================================================================
-- 0012 Fase 4: drift
-- =============================================================================
--
-- Abonnement (Stripe), planer etter antall aktive prosjekter, egne domener,
-- API med nøkler og utsending av webhooks. Tabellene finnes fra 0002. Her
-- kommer reglene og funksjonene serveren trenger:
--
--   * Stripe-webhooken, domenesjekken og webhook-utsendingen skriver gjennom
--     funksjoner som bare service-rollen kan kjøre. Innloggede brukere kan
--     fortsatt ikke sette abonnement eller domenebekreftelse selv.
--   * API-et med nøkkel går gjennom api_*-funksjonene. De finner organisasjonen
--     fra nøkkelen, så et kall aldri kan nå en annen organisasjons data, selv
--     om serveren bruker service-rollen.
--   * Planene begrenser hvor mange prosjekter som kan være aktive samtidig.
--     Grensen håndheves her. Publiserte sider tas aldri ned.

-- -----------------------------------------------------------------------------
-- Organisasjoner: abonnement fra Stripe
-- -----------------------------------------------------------------------------

alter table public.organizations
  add column cancel_at_period_end boolean not null default false,
  add column billing_event_at timestamptz,
  add column billing_notices jsonb not null default '{}'::jsonb check (jsonb_typeof(billing_notices) = 'object'),
  add constraint organizations_plan_known check (plan in ('trial', 'start', 'growth', 'pro', 'enterprise'));

comment on column public.organizations.cancel_at_period_end is
  'Abonnementet er sagt opp og stopper ved slutten av perioden (current_period_end).';
comment on column public.organizations.billing_event_at is
  'Når abonnementet sist ble hentet fra Stripe. En eldre tilstand som kommer sent, overskriver ikke en nyere.';
comment on column public.organizations.billing_notices is
  'Varsler som er sendt om prøveperioden og lesemodus, med tidspunkt. Nullstilles når abonnementet er aktivt.';

-- -----------------------------------------------------------------------------
-- Planer og aktive prosjekter
-- -----------------------------------------------------------------------------
-- Aktive prosjekter er prosjekter i fasene «Kommer for salg», «I salg» og
-- «Utsolgt». Grensene speiles i src/lib/billing/plans.ts.

create function app.is_active_phase(p_phase public.project_phase)
returns boolean
language sql
immutable
set search_path = ''
as $$ select p_phase in ('coming_soon', 'for_sale', 'sold_out') $$;

-- null betyr ingen grense (enterprise avtales særskilt).
create function app.plan_project_limit(p_plan text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case p_plan
    when 'trial' then 3
    when 'start' then 1
    when 'growth' then 5
    when 'pro' then 15
  end;
$$;

-- Et prosjekt kan bare bli aktivt når planen har plass. Prosjekter som allerede
-- er aktive, påvirkes ikke når en organisasjon bytter til en mindre plan.
-- Security definer fordi alle prosjektene i organisasjonen må telles, også de
-- en redaktør ikke har tilgang til. Organisasjonen låses, så to samtidige
-- endringer ikke kan gå forbi grensen.
create function app.enforce_project_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan text;
  v_limit integer;
  v_active integer;
begin
  if not app.is_active_phase(new.phase) or (tg_op = 'UPDATE' and app.is_active_phase(old.phase)) then
    return new;
  end if;
  select o.plan into v_plan from public.organizations o where o.id = new.organization_id for update;
  v_limit := app.plan_project_limit(v_plan);
  if v_limit is null then
    return new;
  end if;
  select count(*) into v_active
  from public.projects p
  where p.organization_id = new.organization_id
    and p.id <> new.id
    and app.is_active_phase(p.phase);
  if v_active >= v_limit then
    raise exception 'Planen har plass til % aktive prosjekter', v_limit
      using errcode = 'P0402', detail = v_limit::text;
  end if;
  return new;
end;
$$;

create trigger enforce_project_limit before insert or update of phase on public.projects
  for each row execute function app.enforce_project_limit();

-- -----------------------------------------------------------------------------
-- Stripe (bare service-rollen)
-- -----------------------------------------------------------------------------

-- Kobler organisasjonen til en Stripe-kunde. Har den allerede en kunde, beholdes
-- den, og svaret er kunden som gjelder.
create function public.link_stripe_customer(p_organization_id uuid, p_customer_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer text;
begin
  if p_customer_id is null or p_customer_id !~ '^cus_[A-Za-z0-9]{1,250}$' then
    raise exception 'Ugyldig Stripe-kunde' using errcode = '22023';
  end if;
  update public.organizations
     set stripe_customer_id = p_customer_id
   where id = p_organization_id and stripe_customer_id is null;
  select o.stripe_customer_id into v_customer from public.organizations o where o.id = p_organization_id;
  if not found then
    raise exception 'Organisasjonen finnes ikke' using errcode = 'P0002';
  end if;
  return v_customer;
end;
$$;

-- Lagrer abonnementet slik Stripe har det nå. Webhooken henter alltid
-- abonnementet på nytt fra Stripe og sender tidspunktet for hentingen, så
-- hendelser som kommer i feil rekkefølge, ikke kan sette en gammel tilstand.
-- Svarer med organisasjonen, eller null når tilstanden ikke ble brukt.
create function public.apply_stripe_subscription(
  p_customer_id text,
  p_subscription_id text,
  p_status public.subscription_status,
  p_plan text default null,
  p_trial_ends_at timestamptz default null,
  p_current_period_end timestamptz default null,
  p_cancel_at_period_end boolean default false,
  p_synced_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old public.organizations;
  v_new public.organizations;
  v_trial_ends_at timestamptz;
  v_writable boolean;
begin
  if p_subscription_id is null or p_subscription_id !~ '^sub_[A-Za-z0-9]{1,250}$' then
    raise exception 'Ugyldig Stripe-abonnement' using errcode = '22023';
  end if;
  if p_plan is not null and p_plan not in ('start', 'growth', 'pro', 'enterprise') then
    raise exception 'Ukjent plan: %', p_plan using errcode = '22023';
  end if;

  select * into v_old from public.organizations o where o.stripe_customer_id = p_customer_id for update;
  if not found then
    return null;
  end if;
  if v_old.billing_event_at is not null and v_old.billing_event_at > p_synced_at then
    return null;
  end if;
  -- Et nytt abonnement som ikke er betalt ennå (eller som ble forlatt), endrer
  -- ingenting: prøveperioden eller abonnementet organisasjonen har, gjelder.
  if p_status in ('incomplete', 'incomplete_expired')
     and v_old.stripe_subscription_id is distinct from p_subscription_id then
    return null;
  end if;
  -- Et gammelt abonnement som avsluttes, overskriver ikke et nyere.
  if p_status = 'canceled'
     and v_old.stripe_subscription_id is not null
     and v_old.stripe_subscription_id <> p_subscription_id then
    return null;
  end if;

  v_trial_ends_at := case when p_status = 'trialing' then p_trial_ends_at else v_old.trial_ends_at end;
  v_writable := app.subscription_allows_writes(p_status, v_trial_ends_at);

  update public.organizations
     set stripe_subscription_id = p_subscription_id,
         subscription_status = p_status,
         plan = coalesce(p_plan, plan),
         trial_ends_at = v_trial_ends_at,
         current_period_end = p_current_period_end,
         cancel_at_period_end = coalesce(p_cancel_at_period_end, false),
         billing_event_at = p_synced_at,
         billing_notices = case
           when p_status = 'active' then '{}'::jsonb
           when v_writable then billing_notices - 'read_only'
           else billing_notices
         end
   where id = v_old.id
  returning * into v_new;

  if v_new.subscription_status is distinct from v_old.subscription_status
     or v_new.plan is distinct from v_old.plan
     or v_new.cancel_at_period_end is distinct from v_old.cancel_at_period_end then
    perform app.write_audit(
      v_new.id, null, 'organization.subscription_changed', 'organization', v_new.id,
      jsonb_build_object(
        'status', v_new.subscription_status, 'previous_status', v_old.subscription_status,
        'plan', v_new.plan, 'previous_plan', v_old.plan,
        'cancel_at_period_end', v_new.cancel_at_period_end, 'read_only', not v_writable
      )
    );
  end if;
  return v_new.id;
end;
$$;

-- Varsler som skal sendes nå: sju dager og én dag før prøveperioden er ute, og
-- når organisasjonen går over i lesemodus. Hvert varsel sendes én gang.
-- Mottakerne er eierne.
create function public.due_billing_notices()
returns table (
  organization_id uuid,
  kind text,
  organization_name text,
  organization_slug text,
  locale text,
  trial_ends_at timestamptz,
  recipients text[]
)
language sql
stable
security definer
set search_path = ''
as $$
  with candidates as (
    select o.*,
      case
        when not app.subscription_allows_writes(o.subscription_status, o.trial_ends_at) then 'read_only'
        when o.subscription_status = 'trialing' and o.stripe_subscription_id is null
             and o.trial_ends_at <= now() + interval '1 day' then 'trial_1d'
        when o.subscription_status = 'trialing' and o.stripe_subscription_id is null
             and o.trial_ends_at <= now() + interval '7 days' then 'trial_7d'
      end as notice
    from public.organizations o
  )
  select c.id, c.notice, c.name, c.slug, c.locale, c.trial_ends_at,
    array(
      select p.email
      from public.memberships m
      join public.profiles p on p.id = m.user_id
      where m.organization_id = c.id and m.role = 'owner' and p.email is not null
      order by p.email
    )
  from candidates c
  where c.notice is not null
    and not (c.billing_notices ? c.notice)
    and not (c.notice = 'trial_7d' and c.billing_notices ? 'trial_1d');
$$;

create function public.mark_billing_notice(p_organization_id uuid, p_kind text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_kind is null or p_kind not in ('trial_7d', 'trial_1d', 'read_only') then
    raise exception 'Ukjent varsel: %', p_kind using errcode = '22023';
  end if;
  update public.organizations
     set billing_notices = billing_notices || jsonb_build_object(p_kind, now())
   where id = p_organization_id;
end;
$$;

-- Support: plattformadmin kan forlenge prøveperioden for en organisasjon uten
-- abonnement i Stripe. Endringen logges.
create function public.extend_trial(p_organization_id uuid, p_days integer)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org public.organizations;
  v_until timestamptz;
begin
  if not app.is_platform_admin() then
    raise exception 'Bare plattformadmin kan forlenge prøveperioden' using errcode = '42501';
  end if;
  if p_days is null or p_days not between 1 and 90 then
    raise exception 'Prøveperioden kan forlenges med 1 til 90 dager' using errcode = '22023';
  end if;
  select * into v_org from public.organizations o where o.id = p_organization_id for update;
  if not found then
    raise exception 'Organisasjonen finnes ikke' using errcode = 'P0002';
  end if;
  if v_org.stripe_subscription_id is not null
     and v_org.subscription_status in ('active', 'trialing', 'past_due', 'unpaid', 'paused') then
    raise exception 'Organisasjonen har et abonnement i Stripe' using errcode = '22023';
  end if;
  v_until := greatest(now(), coalesce(v_org.trial_ends_at, now())) + make_interval(days => p_days);
  update public.organizations
     set subscription_status = 'trialing', trial_ends_at = v_until, billing_notices = '{}'::jsonb
   where id = p_organization_id;
  perform app.write_audit(
    p_organization_id, null, 'organization.trial_extended', 'organization', p_organization_id,
    jsonb_build_object('days', p_days, 'trial_ends_at', v_until)
  );
  return v_until;
end;
$$;

-- -----------------------------------------------------------------------------
-- Egne domener
-- -----------------------------------------------------------------------------

-- Inntil ti domener per prosjektside.
create function app.limit_domains()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.domains d where d.site_id = new.site_id) >= 10 then
    raise exception 'En prosjektside kan ha inntil ti egne domener' using errcode = 'P0413';
  end if;
  return new;
end;
$$;

create trigger limit_domains before insert on public.domains
  for each row execute function app.limit_domains();

-- Resultatet av en DNS-sjekk (serveren, etter oppslag i DNS og hos Vercel).
--   * Et domene blir bekreftet når TXT-posten og DNS-pekeren er riktige.
--   * Et bekreftet domene beholdes ved senere sjekker. Feil vises da som varsel
--     (last_error), så en midlertidig DNS-feil ikke tar ned siden.
--   * Første bekreftede domene på en prosjektside blir primærdomene.
--   * Er vertsnavnet allerede bekreftet på en annen prosjektside, blir domenet
--     stående ubekreftet med feilen hostname_taken.
create function public.record_domain_check(
  p_domain_id uuid,
  p_status text,
  p_dns_records jsonb,
  p_error text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_domain public.domains;
begin
  if p_status is null or p_status not in ('verified', 'pending', 'misconfigured', 'error') then
    raise exception 'Ukjent domenestatus: %', p_status using errcode = '22023';
  end if;
  if p_dns_records is null or jsonb_typeof(p_dns_records) <> 'array' then
    raise exception 'DNS-postene må være en liste' using errcode = '22023';
  end if;

  select * into v_domain from public.domains d where d.id = p_domain_id for update;
  if not found then
    return null;
  end if;

  if p_status = 'verified' then
    if v_domain.verified_at is null and exists (
      select 1 from public.domains d
      where d.hostname = v_domain.hostname and d.verified_at is not null and d.id <> v_domain.id
    ) then
      update public.domains
         set status = 'error', dns_records = p_dns_records, last_checked_at = now(), last_error = 'hostname_taken'
       where id = p_domain_id;
      return 'error';
    end if;
    update public.domains
       set status = 'verified', verified_at = coalesce(verified_at, now()), dns_records = p_dns_records,
           last_checked_at = now(), last_error = null
     where id = p_domain_id;
    if not exists (select 1 from public.domains d where d.site_id = v_domain.site_id and d.is_primary) then
      update public.domains set is_primary = true where id = p_domain_id;
    end if;
    return 'verified';
  end if;

  if v_domain.verified_at is not null then
    update public.domains
       set dns_records = p_dns_records, last_checked_at = now(), last_error = left(coalesce(p_error, p_status), 2000)
     where id = p_domain_id;
    return 'verified';
  end if;

  update public.domains
     set status = p_status, dns_records = p_dns_records, last_checked_at = now(), last_error = left(p_error, 2000)
   where id = p_domain_id;
  return p_status;
end;
$$;

-- Domener jobben skal sjekke nå. Ubekreftede domener sjekkes hvert femte minutt
-- det første døgnet og deretter hver time i 30 dager. Bekreftede sjekkes daglig.
create function public.domains_due_for_check(p_limit integer default 50)
returns table (
  domain_id uuid,
  organization_id uuid,
  site_id uuid,
  hostname text,
  verification_token text,
  verified boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select d.id, d.organization_id, d.site_id, d.hostname, d.verification_token, d.verified_at is not null
  from public.domains d
  where (
      d.verified_at is null
      and d.created_at > now() - interval '30 days'
      and (
        d.last_checked_at is null
        or d.last_checked_at < now() - case
          when d.created_at > now() - interval '1 day' then interval '5 minutes'
          else interval '1 hour'
        end
      )
    )
    or (
      d.verified_at is not null
      and (d.last_checked_at is null or d.last_checked_at < now() - interval '1 day')
    )
  order by d.last_checked_at nulls first, d.created_at
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

-- Bytter primærdomene på en prosjektside. null betyr ingen: underdomenet er da
-- hovedadressen. Bare bekreftede domener kan være primærdomene.
create function public.set_primary_domain(p_site_id uuid, p_domain_id uuid default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_site public.sites;
begin
  select * into v_site from public.sites s where s.id = p_site_id;
  if not found or not app.has_org_role(v_site.organization_id, app.roles_admin(), true) then
    raise exception 'Mangler tilgang til prosjektsiden' using errcode = '42501';
  end if;
  if p_domain_id is not null and not exists (
    select 1 from public.domains d
    where d.id = p_domain_id and d.site_id = p_site_id and d.verified_at is not null
  ) then
    raise exception 'Bare et bekreftet domene på prosjektsiden kan være primærdomene' using errcode = '22023';
  end if;
  update public.domains
     set is_primary = false
   where site_id = p_site_id and is_primary and id is distinct from p_domain_id;
  if p_domain_id is not null then
    update public.domains set is_primary = true where id = p_domain_id and not is_primary;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Sporingskoder
-- -----------------------------------------------------------------------------
-- Kodene settes inn i skript på publiserte sider, så de kontrolleres strengt
-- både her og i appen.

create function app.valid_analytics_ids(p_ids jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(p_ids) = 'object'
    and not exists (select 1 from jsonb_object_keys(p_ids) as k where k not in ('ga4', 'gtm', 'meta_pixel'))
    and (not p_ids ? 'ga4' or (jsonb_typeof(p_ids -> 'ga4') = 'string' and p_ids ->> 'ga4' ~ '^G-[A-Z0-9]{4,20}$'))
    and (not p_ids ? 'gtm' or (jsonb_typeof(p_ids -> 'gtm') = 'string' and p_ids ->> 'gtm' ~ '^GTM-[A-Z0-9]{4,12}$'))
    and (not p_ids ? 'meta_pixel'
         or (jsonb_typeof(p_ids -> 'meta_pixel') = 'string' and p_ids ->> 'meta_pixel' ~ '^[0-9]{6,20}$'));
$$;

alter table public.projects
  add constraint projects_analytics_ids_valid check (app.valid_analytics_ids(analytics_ids));

-- Den publiserte siden trenger lagringstiden for leads til personvernsiden, og
-- sporingskodene (fra før) til samtykkebanneret. Ellers som i 0006.
create or replace function public.resolve_site(p_hostname text default null, p_subdomain text default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with site as (
    select s.*
    from public.sites s
    where s.published_at is not null
      and (
        (p_hostname is not null and s.id in (
          select d.site_id from public.domains d
          where d.hostname = lower(p_hostname) and d.verified_at is not null
        ))
        or (p_subdomain is not null and s.subdomain = lower(p_subdomain))
      )
    limit 1
  )
  select jsonb_build_object(
    'site', jsonb_build_object(
      'id', s.id,
      'subdomain', s.subdomain,
      'primary_hostname', (
        select d.hostname from public.domains d
        where d.site_id = s.id and d.is_primary and d.verified_at is not null
      ),
      'config', s.published_config,
      'published_at', s.published_at
    ),
    'project', app.public_project(p) || jsonb_build_object(
      'analytics_ids', p.analytics_ids,
      'contacts', app.public_contacts(p)
    ),
    'organization', jsonb_build_object(
      'name', o.name,
      'locale', o.locale,
      'brand', o.brand,
      'logo', app.public_asset(o.id, o.logo_asset_id),
      'lead_retention_days', o.lead_retention_days
    ),
    'pages', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', pg.id,
        'slug', pg.published_slug,
        'title', pg.published_meta ->> 'title',
        'is_home', pg.id::text = s.published_config ->> 'home_page_id'
      ) order by pg.sort_order, pg.created_at), '[]'::jsonb)
      from public.pages pg
      where pg.site_id = s.id and pg.published_at is not null
    )
  )
  from site s
  join public.projects p on p.id = s.project_id
  join public.organizations o on o.id = s.organization_id;
$$;

-- -----------------------------------------------------------------------------
-- Revisjonslogg: handlinger med API-nøkkel
-- -----------------------------------------------------------------------------
-- api_update_unit() setter app.api_key_id mens endringen skjer. Logglinjene får
-- da aktøren «api_key» og nøkkelens id.

create or replace function app.write_audit(
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
  v_api_key uuid := app.try_uuid(nullif(current_setting('app.api_key_id', true), ''));
  v_data jsonb := coalesce(p_data, '{}'::jsonb);
begin
  if v_actor is not null then
    v_actor_type := case
      when app.is_platform_admin() and not exists (
        select 1 from public.memberships m
        where m.organization_id = p_organization_id and m.user_id = v_actor
      ) then 'platform_admin'
      else 'user'
    end;
  elsif v_api_key is not null then
    v_actor_type := 'api_key';
    v_data := v_data || jsonb_build_object('api_key_id', v_api_key);
  end if;

  insert into public.audit_log (
    organization_id, project_id, actor_id, actor_email, actor_type,
    action, entity_type, entity_id, data
  )
  values (
    p_organization_id, p_project_id, v_actor, v_claims ->> 'email', v_actor_type,
    p_action, p_entity_type, p_entity_id, v_data
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- API med nøkkel (bare service-rollen)
-- -----------------------------------------------------------------------------
-- Serveren tar imot nøkkelen, lager SHA-256 av den og kaller funksjonene under
-- med hashen. Selve nøkkelen lagres aldri. Hver funksjon:
--   1. finner en aktiv nøkkel (ikke trukket tilbake, ikke utløpt) med riktig tilgang,
--   2. holder rate limit: 600 kall per minutt per nøkkel,
--   3. leser og skriver bare i nøkkelens organisasjon.
-- Feilkoder: 28000 ugyldig nøkkel, 42501 mangler tilgang, P0429 rate limit,
-- P0002 finnes ikke, 22023 ugyldig input, 25006 lesemodus.

create function app.api_key_for(p_key_hash text, p_scope text)
returns public.api_keys
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key public.api_keys;
begin
  if p_key_hash is null or p_key_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Ugyldig API-nøkkel' using errcode = '28000';
  end if;
  select * into v_key
  from public.api_keys k
  where k.key_hash = p_key_hash
    and k.revoked_at is null
    and (k.expires_at is null or k.expires_at > now());
  if not found then
    raise exception 'Ugyldig API-nøkkel' using errcode = '28000';
  end if;
  if not (p_scope = any (v_key.scopes)) then
    raise exception 'API-nøkkelen mangler tilgangen %', p_scope using errcode = '42501';
  end if;
  if not public.rate_limit_hit(v_key.organization_id, 'api:' || v_key.id::text, 600, 60) then
    raise exception 'For mange kall med API-nøkkelen' using errcode = 'P0429';
  end if;
  if v_key.last_used_at is null or v_key.last_used_at < now() - interval '1 minute' then
    update public.api_keys set last_used_at = now() where id = v_key.id;
  end if;
  return v_key;
end;
$$;

create function app.api_unit_json(p_unit public.units)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p_unit.id,
    'project_id', p_unit.project_id,
    'unit_number', p_unit.unit_number,
    'slug', p_unit.slug,
    'title', p_unit.title,
    'unit_type', p_unit.unit_type,
    'status', p_unit.status,
    'floor', p_unit.floor,
    'rooms', p_unit.rooms,
    'bedrooms', p_unit.bedrooms,
    'bathrooms', p_unit.bathrooms,
    'bra_i', p_unit.bra_i,
    'bra_e', p_unit.bra_e,
    'bra_b', p_unit.bra_b,
    'tba', p_unit.tba,
    'plot_area', p_unit.plot_area,
    'price', p_unit.price,
    'purchase_costs', p_unit.purchase_costs,
    'shared_debt', p_unit.shared_debt,
    'monthly_fee', p_unit.monthly_fee,
    'ownership_type', p_unit.ownership_type,
    'orientation', p_unit.orientation,
    'parking', p_unit.parking,
    'storage', p_unit.storage,
    'description', p_unit.description,
    'custom_fields', p_unit.custom_fields,
    'external_id', p_unit.external_id,
    'source', p_unit.source,
    'sort_order', p_unit.sort_order,
    'is_hidden', p_unit.is_hidden,
    'stage', (select jsonb_build_object('id', s.id, 'name', s.name) from public.stages s where s.id = p_unit.stage_id),
    'building', (select jsonb_build_object('id', b.id, 'name', b.name) from public.buildings b where b.id = p_unit.building_id),
    'created_at', p_unit.created_at,
    'updated_at', p_unit.updated_at
  );
$$;

-- GET /api/v1/projects
create function public.api_projects(p_key_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key public.api_keys := app.api_key_for(p_key_hash, 'projects:read');
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'slug', p.slug,
      'phase', p.phase,
      'address', p.address,
      'postal_code', p.postal_code,
      'city', p.city,
      'municipality', p.municipality,
      'lat', p.lat,
      'lng', p.lng,
      'description', p.description,
      'milestones', p.milestones,
      'unit_counts', (
        select jsonb_build_object(
          'total', count(*),
          'upcoming', count(*) filter (where u.status = 'upcoming'),
          'available', count(*) filter (where u.status = 'available'),
          'reserved', count(*) filter (where u.status = 'reserved'),
          'sold', count(*) filter (where u.status = 'sold')
        )
        from public.units u where u.project_id = p.id
      ),
      'created_at', p.created_at,
      'updated_at', p.updated_at
    ) order by p.created_at)
    from public.projects p
    where p.organization_id = v_key.organization_id
  ), '[]'::jsonb);
end;
$$;

-- GET /api/v1/projects/{id}/units. Alle enheter, også skjulte, med interne felt.
create function public.api_units(p_key_hash text, p_project_id uuid, p_updated_since timestamptz default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key public.api_keys := app.api_key_for(p_key_hash, 'units:read');
begin
  if not exists (
    select 1 from public.projects p where p.id = p_project_id and p.organization_id = v_key.organization_id
  ) then
    raise exception 'Prosjektet finnes ikke' using errcode = 'P0002';
  end if;
  return coalesce((
    select jsonb_agg(app.api_unit_json(u) order by u.sort_order, u.unit_number)
    from public.units u
    where u.project_id = p_project_id
      and u.organization_id = v_key.organization_id
      and (p_updated_since is null or u.updated_at > p_updated_since)
  ), '[]'::jsonb);
end;
$$;

-- PATCH /api/v1/projects/{id}/units/{enhet}. Enheten oppgis med id eller
-- enhetsnummer. Bare status (med notat) og prisfeltene kan endres, som for en
-- megler. Statusendringen logges med kilden «api» og går ut i sanntid.
create function public.api_update_unit(p_key_hash text, p_project_id uuid, p_unit text, p_changes jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key public.api_keys := app.api_key_for(p_key_hash, 'units:write');
  v_org public.organizations;
  v_unit public.units;
  v_field text;
  v_number numeric;
  v_status public.unit_status;
  v_note text;
begin
  select * into v_org from public.organizations o where o.id = v_key.organization_id;
  if not app.subscription_allows_writes(v_org.subscription_status, v_org.trial_ends_at) then
    raise exception 'Organisasjonen er i lesemodus' using errcode = '25006';
  end if;
  if p_changes is null or jsonb_typeof(p_changes) <> 'object' or p_changes = '{}'::jsonb then
    raise exception 'Ingen endringer' using errcode = '22023';
  end if;
  for v_field in select jsonb_object_keys(p_changes) loop
    if v_field not in ('status', 'note', 'price', 'purchase_costs', 'shared_debt', 'monthly_fee') then
      raise exception 'Feltet % kan ikke endres med API-et', v_field using errcode = '22023';
    end if;
  end loop;
  foreach v_field in array array['price', 'purchase_costs', 'shared_debt', 'monthly_fee'] loop
    if p_changes ? v_field and jsonb_typeof(p_changes -> v_field) <> 'null' then
      if jsonb_typeof(p_changes -> v_field) <> 'number' then
        raise exception 'Feltet % må være et tall', v_field using errcode = '22023';
      end if;
      v_number := (p_changes ->> v_field)::numeric;
      if v_number < 0 or v_number <> trunc(v_number)
         or v_number > (case when v_field = 'monthly_fee' then 2147483647 else 9007199254740991 end) then
        raise exception 'Feltet % må være et heltall som ikke er negativt', v_field using errcode = '22023';
      end if;
    end if;
  end loop;
  if p_changes ? 'status' then
    if jsonb_typeof(p_changes -> 'status') <> 'string'
       or p_changes ->> 'status' not in ('upcoming', 'available', 'reserved', 'sold') then
      raise exception 'Ukjent status' using errcode = '22023';
    end if;
    v_status := (p_changes ->> 'status')::public.unit_status;
  end if;
  if p_changes ? 'note' then
    if jsonb_typeof(p_changes -> 'note') not in ('string', 'null') or char_length(p_changes ->> 'note') > 500 then
      raise exception 'Notatet kan ha inntil 500 tegn' using errcode = '22023';
    end if;
    v_note := btrim(p_changes ->> 'note');
  end if;

  select * into v_unit
  from public.units u
  where u.project_id = p_project_id
    and u.organization_id = v_key.organization_id
    and (u.id = app.try_uuid(p_unit) or u.unit_number = p_unit)
  order by (u.id = app.try_uuid(p_unit)) desc nulls last
  limit 1
  for update;
  if not found then
    raise exception 'Enheten finnes ikke' using errcode = 'P0002';
  end if;

  perform set_config('app.api_key_id', v_key.id::text, true);
  perform set_config('app.status_note', coalesce(v_note, ''), true);
  perform set_config('app.status_source', 'api', true);
  update public.units u
     set status = coalesce(v_status, u.status),
         price = case when p_changes ? 'price' then (p_changes ->> 'price')::bigint else u.price end,
         purchase_costs = case when p_changes ? 'purchase_costs' then (p_changes ->> 'purchase_costs')::bigint else u.purchase_costs end,
         shared_debt = case when p_changes ? 'shared_debt' then (p_changes ->> 'shared_debt')::bigint else u.shared_debt end,
         monthly_fee = case when p_changes ? 'monthly_fee' then (p_changes ->> 'monthly_fee')::integer else u.monthly_fee end
   where u.id = v_unit.id
  returning * into v_unit;
  perform set_config('app.status_note', '', true);
  perform set_config('app.status_source', '', true);
  perform set_config('app.api_key_id', '', true);
  return app.api_unit_json(v_unit);
end;
$$;

-- GET /api/v1/leads. Eldste først, så en integrasjon kan hente nye leads med
-- «since» satt til created_at for det siste den har fått. Internt notat er ikke med.
create function public.api_leads(
  p_key_hash text,
  p_project_id uuid default null,
  p_since timestamptz default null,
  p_limit integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key public.api_keys := app.api_key_for(p_key_hash, 'leads:read');
begin
  if p_project_id is not null and not exists (
    select 1 from public.projects p where p.id = p_project_id and p.organization_id = v_key.organization_id
  ) then
    raise exception 'Prosjektet finnes ikke' using errcode = 'P0002';
  end if;
  return coalesce((
    select jsonb_agg(item.data order by item.created_at, item.id)
    from (
      select l.id, l.created_at, jsonb_build_object(
        'id', l.id,
        'project_id', l.project_id,
        'unit_id', l.unit_id,
        'unit_number', l.unit_number,
        'page_id', l.page_id,
        'name', l.name,
        'email', l.email,
        'phone', l.phone,
        'message', l.message,
        'consent_contact', l.consent_contact,
        'consent_similar_projects', l.consent_similar_projects,
        'consent_text_version', l.consent_text_version,
        'consented_at', l.consented_at,
        'source', l.source,
        'utm', l.utm,
        'status', l.status,
        'created_at', l.created_at,
        'updated_at', l.updated_at
      ) as data
      from public.leads l
      where l.organization_id = v_key.organization_id
        and (p_project_id is null or l.project_id = p_project_id)
        and (p_since is null or l.created_at > p_since)
      order by l.created_at, l.id
      limit greatest(1, least(coalesce(p_limit, 100), 500))
    ) as item
  ), '[]'::jsonb);
end;
$$;

-- -----------------------------------------------------------------------------
-- Webhooks
-- -----------------------------------------------------------------------------

-- Testhendelser sendes én gang, uten nye forsøk.
alter table public.webhook_deliveries add column is_test boolean not null default false;

-- Hendelsene får også enhetens eksterne id, så meglersystemer kan koble dem.
create or replace function app.publish_unit_status_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_external_id text;
begin
  select u.external_id into v_external_id from public.units u where u.id = new.unit_id;
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
      'unit_id', new.unit_id, 'unit_number', new.unit_number, 'external_id', v_external_id,
      'project_id', new.project_id, 'from_status', new.from_status, 'to_status', new.to_status,
      'source', new.source, 'changed_at', new.created_at
    )
  );
  perform app.broadcast_unit_status(new.project_id, new.unit_id, new.to_status);
  return null;
end;
$$;

create or replace function app.leads_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_external_id text;
begin
  if new.unit_id is not null then
    select u.external_id into v_external_id from public.units u where u.id = new.unit_id;
  end if;
  perform app.enqueue_webhooks(
    new.organization_id, new.project_id, 'lead.created',
    jsonb_build_object(
      'lead_id', new.id, 'project_id', new.project_id, 'unit_id', new.unit_id,
      'unit_number', new.unit_number, 'unit_external_id', v_external_id, 'page_id', new.page_id,
      'name', new.name, 'email', new.email, 'phone', new.phone,
      'message', new.message, 'consent_contact', new.consent_contact,
      'consent_similar_projects', new.consent_similar_projects,
      'consent_text_version', new.consent_text_version, 'consented_at', new.consented_at,
      'source', new.source, 'utm', new.utm, 'created_at', new.created_at
    )
  );
  return null;
end;
$$;

-- Leveranser til webhooks som er slått av, venter til webhooken slås på igjen
-- (eller til de går ut, se daglig vedlikehold).
create or replace function public.claim_webhook_deliveries(p_limit integer default 25)
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
    join public.webhooks w on w.id = d.webhook_id
    where d.status = 'pending' and d.next_attempt_at <= now() and w.is_active
    order by d.next_attempt_at
    limit greatest(1, least(coalesce(p_limit, 25), 100))
    for update of d skip locked
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

-- Én bestemt leveranse som skal sendes nå: testhendelse eller nytt forsøk fra admin.
create function public.claim_webhook_delivery(p_delivery_id uuid)
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
  with claimed as (
    update public.webhook_deliveries d
       set attempts = d.attempts + 1,
           next_attempt_at = now() + interval '10 minutes'
     where d.id = p_delivery_id and d.status = 'pending' and d.next_attempt_at <= now()
    returning d.id, d.webhook_id, d.event, d.payload, d.attempts
  )
  select c.id, c.webhook_id, w.url, w.secret, c.event, c.payload, c.attempts
  from claimed c
  join public.webhooks w on w.id = c.webhook_id;
end;
$$;

create or replace function public.complete_webhook_delivery(
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
    -- Nye forsøk etter 1, 2, 4, 8 … minutter, høyst 6 timer mellom. Etter åtte
    -- forsøk (omtrent to timer) gis leveransen opp. Testhendelser prøves én gang.
    update public.webhook_deliveries
       set status = case when v_delivery.attempts >= 8 or v_delivery.is_test then 'failed' else 'pending' end,
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

-- «Send testhendelse» i admin.
create function public.send_test_webhook(p_webhook_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_webhook public.webhooks;
  v_delivery_id uuid;
begin
  select * into v_webhook from public.webhooks w where w.id = p_webhook_id;
  if not found or not app.has_org_role(v_webhook.organization_id, app.roles_admin(), true) then
    raise exception 'Mangler tilgang til webhooken' using errcode = '42501';
  end if;
  insert into public.webhook_deliveries (organization_id, webhook_id, event, payload, is_test)
  values (
    v_webhook.organization_id, v_webhook.id, 'webhook.test',
    jsonb_build_object(
      'id', gen_random_uuid(), 'type', 'webhook.test', 'created_at', now(),
      'data', jsonb_build_object('webhook_id', v_webhook.id)
    ),
    true
  )
  returning id into v_delivery_id;
  return v_delivery_id;
end;
$$;

-- «Prøv igjen» på en leveranse som har feilet.
create function public.retry_webhook_delivery(p_delivery_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_delivery public.webhook_deliveries;
begin
  select * into v_delivery from public.webhook_deliveries d where d.id = p_delivery_id for update;
  if not found or not app.has_org_role(v_delivery.organization_id, app.roles_admin(), true) then
    raise exception 'Mangler tilgang til leveransen' using errcode = '42501';
  end if;
  if v_delivery.status = 'succeeded' then
    raise exception 'Leveransen er allerede levert' using errcode = '22023';
  end if;
  update public.webhook_deliveries
     set status = 'pending', attempts = 0, next_attempt_at = now(), last_error = null
   where id = p_delivery_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Daglig vedlikehold: også leveranser som har ventet i tre døgn
-- -----------------------------------------------------------------------------
-- En aktiv webhook gir opp etter omtrent to timer. Det som fortsatt venter
-- etter tre døgn, hører til en webhook som er slått av.

create or replace function app.run_daily_maintenance()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_leads integer;
  v_expired integer;
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

  update public.webhook_deliveries
     set status = 'failed', last_error = coalesce(last_error, 'expired')
   where status = 'pending' and created_at < now() - interval '3 days';
  get diagnostics v_expired = row_count;

  delete from public.webhook_deliveries
  where status <> 'pending' and created_at < now() - interval '30 days';
  get diagnostics v_deliveries = row_count;

  delete from public.rate_limit_buckets where window_start < now() - interval '1 day';
  get diagnostics v_buckets = row_count;

  return jsonb_build_object(
    'leads_deleted', v_leads,
    'webhook_deliveries_expired', v_expired,
    'webhook_deliveries_deleted', v_deliveries,
    'rate_limit_buckets_deleted', v_buckets
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Rettigheter
-- -----------------------------------------------------------------------------

grant execute on function
  app.is_active_phase(public.project_phase),
  app.plan_project_limit(text),
  app.valid_analytics_ids(jsonb)
to authenticated, service_role;

grant execute on function
  public.set_primary_domain(uuid, uuid),
  public.send_test_webhook(uuid),
  public.retry_webhook_delivery(uuid),
  public.extend_trial(uuid, integer)
to authenticated;

grant execute on function
  public.link_stripe_customer(uuid, text),
  public.apply_stripe_subscription(text, text, public.subscription_status, text, timestamptz, timestamptz, boolean, timestamptz),
  public.due_billing_notices(),
  public.mark_billing_notice(uuid, text),
  public.record_domain_check(uuid, text, jsonb, text),
  public.domains_due_for_check(integer),
  public.claim_webhook_delivery(uuid),
  public.api_projects(text),
  public.api_units(text, uuid, timestamptz),
  public.api_update_unit(text, uuid, text, jsonb),
  public.api_leads(text, uuid, timestamptz, integer)
to service_role;
