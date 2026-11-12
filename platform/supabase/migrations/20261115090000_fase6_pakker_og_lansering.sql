-- =============================================================================
-- 0015 Fase 6: pakker og oppstartsavgift
-- =============================================================================
--
-- Ny prismodell (docs/arkitektur.md, avsnitt 23):
--
--   * Organisasjonen velger én av tre pakker: Prosjektside (start), Pro eller
--     Partner. Pakken styrer funksjoner og grenser: antall brukere, egne domener
--     per prosjektside, og om API, webhooks og innbygging er med. Antall
--     prosjekter er ikke lenger begrenset.
--   * Hvert prosjekt lanseres én gang. Lanseringen koster en oppstartsavgift
--     etter antall enheter, og prosjektet kan ikke publiseres før det er
--     lansert. Avgiften dekker et nivå (for eksempel inntil 39 enheter). Flere
--     enheter enn nivået krever at differansen betales.
--   * Prøveperioden (30 dager uten kort) har funksjonene i Pro, for å bygge og
--     forhåndsvise. Publisering krever lansering.
--
-- Beløpene for nivåene står i src/lib/billing/launch.ts. Databasen lagrer hva
-- som er betalt og hvilket nivå det dekker. Betalingen registreres bare av
-- service-rollen (Stripe-webhooken og returen fra Checkout).

-- -----------------------------------------------------------------------------
-- Pakkene
-- -----------------------------------------------------------------------------
-- «Vekst» (growth) finnes ikke lenger. Organisasjoner som hadde den, får Pro.

alter table public.organizations drop constraint organizations_plan_known;
update public.organizations set plan = 'pro' where plan = 'growth';
alter table public.organizations
  add constraint organizations_plan_known check (plan in ('trial', 'start', 'pro', 'partner', 'enterprise'));

-- Grensen for aktive prosjekter erstattes av oppstartsavgiften per prosjekt.
drop trigger enforce_project_limit on public.projects;
drop function app.enforce_project_limit();
drop function app.plan_project_limit(text);

-- Samme funksjon som i 0012, med de nye pakkene.
create or replace function public.apply_stripe_subscription(
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
  if p_plan is not null and p_plan not in ('start', 'pro', 'partner', 'enterprise') then
    raise exception 'Ukjent pakke: %', p_plan using errcode = '22023';
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

-- Grensene og funksjonene i hver pakke. Speiles i src/lib/billing/plans.ts.
-- En ukjent pakke får de strengeste grensene.

-- Høyeste antall brukere (medlemmer og ventende invitasjoner). null: ingen grense.
create function app.plan_member_limit(p_plan text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_plan in ('partner', 'enterprise') then null
    when p_plan in ('trial', 'pro') then 10
    else 3
  end;
$$;

-- Høyeste antall egne domener per prosjektside.
create function app.plan_domain_limit(p_plan text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case when p_plan in ('trial', 'pro', 'partner', 'enterprise') then 10 else 1 end;
$$;

-- Funksjoner som ikke er med i alle pakker: api (API-nøkler og det offentlige
-- lese-API-et), webhooks og embed (boligvelgeren bygd inn på andre nettsteder).
create function app.plan_allows(p_plan text, p_feature text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_feature in ('api', 'webhooks', 'embed')
     and p_plan in ('trial', 'pro', 'partner', 'enterprise');
$$;

create function app.organization_plan(p_organization_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$ select o.plan from public.organizations o where o.id = p_organization_id $$;

-- -----------------------------------------------------------------------------
-- Brukere
-- -----------------------------------------------------------------------------
-- Medlemmer og ventende invitasjoner teller. En invitasjon til noen som allerede
-- er medlem (for å gi tilgang til flere prosjekter), tar ikke en ny plass.
-- Organisasjoner som har flere brukere enn pakken (etter bytte til en mindre
-- pakke), beholder dem, men kan ikke legge til nye.

create function app.limit_members()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit integer := app.plan_member_limit(app.organization_plan(new.organization_id));
  v_used integer;
begin
  if v_limit is null then
    return new;
  end if;

  if tg_table_name = 'memberships' then
    -- Finnes medlemskapet allerede, hopper «on conflict do nothing» over raden.
    if exists (
      select 1 from public.memberships m
      where m.organization_id = new.organization_id and m.user_id = new.user_id
    ) then
      return new;
    end if;
    select count(*) into v_used from public.memberships m where m.organization_id = new.organization_id;
  else
    -- Bare en invitasjon som blir gyldig, tar en ny plass.
    if new.accepted_at is not null or new.revoked_at is not null or new.expires_at <= now() then
      return new;
    end if;
    if tg_op = 'UPDATE' and old.accepted_at is null and old.revoked_at is null and old.expires_at > now() then
      return new;
    end if;
    if exists (
      select 1 from public.memberships m
      join public.profiles p on p.id = m.user_id
      where m.organization_id = new.organization_id and lower(p.email) = lower(new.email)
    ) then
      return new;
    end if;
    select
      (select count(*) from public.memberships m where m.organization_id = new.organization_id)
      + (
        select count(*) from public.invitations i
        where i.organization_id = new.organization_id
          and i.id <> new.id
          and i.accepted_at is null and i.revoked_at is null and i.expires_at > now()
          and not exists (
            select 1 from public.memberships m
            join public.profiles p on p.id = m.user_id
            where m.organization_id = i.organization_id and lower(p.email) = lower(i.email)
          )
      )
    into v_used;
  end if;

  if v_used >= v_limit then
    raise exception 'Pakken har plass til % brukere', v_limit
      using errcode = 'P0413', detail = 'members:' || v_limit;
  end if;
  return new;
end;
$$;

create trigger limit_members before insert on public.memberships
  for each row execute function app.limit_members();
create trigger limit_members before insert or update of expires_at, revoked_at on public.invitations
  for each row execute function app.limit_members();

-- -----------------------------------------------------------------------------
-- Egne domener
-- -----------------------------------------------------------------------------

create or replace function app.limit_domains()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit integer := app.plan_domain_limit(app.organization_plan(new.organization_id));
begin
  if (select count(*) from public.domains d where d.site_id = new.site_id) >= v_limit then
    raise exception 'Pakken har plass til % egne domener per prosjektside', v_limit
      using errcode = 'P0413', detail = 'domains:' || v_limit;
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- API, webhooks og innbygging
-- -----------------------------------------------------------------------------

-- Nye API-nøkler og webhooks krever at pakken har funksjonen (argumentet).
create function app.require_plan_feature()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app.plan_allows(app.organization_plan(new.organization_id), tg_argv[0]) then
    raise exception 'Pakken har ikke %', tg_argv[0] using errcode = 'P0403', detail = tg_argv[0];
  end if;
  return new;
end;
$$;

create trigger require_plan_feature before insert on public.api_keys
  for each row execute function app.require_plan_feature('api');
create trigger require_plan_feature before insert on public.webhooks
  for each row execute function app.require_plan_feature('webhooks');

-- Nøkler som finnes, slutter å virke når organisasjonen bytter til en pakke uten API.
create or replace function app.api_key_for(p_key_hash text, p_scope text)
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
  if not app.plan_allows(app.organization_plan(v_key.organization_id), 'api') then
    raise exception 'Pakken til organisasjonen har ikke API' using errcode = 'P0403', detail = 'api';
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

-- Hendelser legges ikke i utboksen når pakken ikke har webhooks.
create or replace function app.enqueue_webhooks(
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
  if not app.plan_allows(app.organization_plan(p_organization_id), 'webhooks') then
    return;
  end if;
  insert into public.webhook_deliveries (organization_id, webhook_id, event, payload)
  select w.organization_id, w.id, p_event, v_payload
  from public.webhooks w
  where w.organization_id = p_organization_id
    and w.is_active
    and p_event = any (w.events)
    and (w.project_ids is null or p_project_id = any (w.project_ids));
end;
$$;

create or replace function public.send_test_webhook(p_webhook_id uuid)
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
  if not app.plan_allows(app.organization_plan(v_webhook.organization_id), 'webhooks') then
    raise exception 'Pakken har ikke webhooks' using errcode = 'P0403', detail = 'webhooks';
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

-- Om innbygging (embed) eller det offentlige lese-API-et (api) er med i pakken
-- til prosjektet bak en publisert boligvelger eller et publisert prosjekt.
-- Svarer false for prosjekter som ikke er publisert, så funksjonen ikke sier
-- noe om upubliserte prosjekter.
create function public.integration_allowed(
  p_feature text,
  p_selector_id uuid default null,
  p_project_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select p_feature in ('api', 'embed')
       and app.project_is_public(p.id)
       and app.plan_allows(o.plan, p_feature)
    from public.projects p
    join public.organizations o on o.id = p.organization_id
    where p.id = coalesce(p_project_id, (select s.project_id from public.selectors s where s.id = p_selector_id))
  ), false);
$$;

-- -----------------------------------------------------------------------------
-- Lansering per prosjekt
-- -----------------------------------------------------------------------------

alter table public.projects
  add column launched_at timestamptz,
  add column launch_unit_limit integer check (launch_unit_limit is null or launch_unit_limit > 0);

comment on column public.projects.launched_at is
  'Når prosjektet ble lansert (oppstartsavgiften betalt eller frafalt). Prosjektet kan ikke publiseres før det er lansert.';
comment on column public.projects.launch_unit_limit is
  'Antall enheter oppstartsavgiften dekker. null betyr ingen grense (avtale). Gjelder bare når prosjektet er lansert.';

-- Lanseringen settes bare av funksjonene under. Innloggede brukere får skrive
-- alle de andre kolonnene, som før.
do $$
declare
  v_columns text;
begin
  select string_agg(quote_ident(c.column_name), ', ' order by c.ordinal_position)
    into v_columns
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = 'projects'
    and c.column_name not in ('launched_at', 'launch_unit_limit');
  execute 'revoke insert, update on public.projects from authenticated';
  execute format('grant insert (%1$s), update (%1$s) on public.projects to authenticated', v_columns);
end;
$$;

-- Betalinger og frafall. En rad per Checkout-økt (lansering eller utvidelse)
-- eller frafall. Bare service-rollen skriver, gjennom funksjonene under.
create table public.project_launches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  kind text not null check (kind in ('launch', 'upgrade', 'waiver')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'waived', 'expired')),
  -- Enheter i prosjektet da avgiften ble regnet ut.
  units integer not null check (units >= 0),
  -- Nivået betalingen dekker. null: ingen grense (frafall etter avtale).
  unit_limit integer check (unit_limit is null or unit_limit > 0),
  -- I øre, uten mva.
  amount integer not null default 0 check (amount >= 0),
  currency text not null default 'nok' check (currency ~ '^[a-z]{3}$'),
  stripe_checkout_session_id text unique check (stripe_checkout_session_id ~ '^cs_[A-Za-z0-9_]{1,250}$'),
  stripe_payment_intent_id text check (stripe_payment_intent_id ~ '^pi_[A-Za-z0-9_]{1,250}$'),
  note text check (char_length(note) <= 500),
  created_by uuid references public.profiles (id) on delete set null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((kind = 'waiver') = (status = 'waived')),
  check (kind = 'waiver' or (amount > 0 and unit_limit is not null)),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade
);
create index project_launches_project_idx on public.project_launches (project_id, organization_id, created_at desc);
create index project_launches_organization_idx on public.project_launches (organization_id);
create index project_launches_created_by_idx on public.project_launches (created_by) where created_by is not null;

comment on table public.project_launches is
  'Oppstartsavgift per prosjekt: betalinger via Stripe Checkout og frafall etter avtale.';

create trigger set_updated_at before update on public.project_launches
  for each row execute function app.set_updated_at();
create trigger prevent_key_changes before update on public.project_launches
  for each row execute function app.prevent_column_changes('id', 'organization_id', 'project_id', 'kind');

alter table public.project_launches enable row level security;
revoke insert, update, delete on public.project_launches from authenticated;

create policy "project_launches: lese" on public.project_launches
  for select to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin())) or (select app.is_platform_admin()));

-- Publisering krever lansering. Gjelder publish_site() og publish_selector(),
-- som setter published_at. Avpublisering er alltid lov.
create function app.require_launch_on_publish()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.published_at is not null
     and not exists (select 1 from public.projects p where p.id = new.project_id and p.launched_at is not null) then
    raise exception 'Prosjektet må lanseres før det kan publiseres' using errcode = 'P0402', detail = 'launch';
  end if;
  return new;
end;
$$;

create trigger require_launch before update of published_at on public.sites
  for each row execute function app.require_launch_on_publish();
create trigger require_launch before update of published_at on public.selectors
  for each row execute function app.require_launch_on_publish();

-- Et lansert prosjekt kan ikke få flere enheter enn nivået som er betalt.
create function app.limit_launched_units()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit integer;
begin
  select p.launch_unit_limit into v_limit
  from public.projects p
  where p.id = new.project_id and p.launched_at is not null;
  if v_limit is not null
     and (select count(*) from public.units u where u.project_id = new.project_id) >= v_limit then
    raise exception 'Oppstartsavgiften dekker inntil % enheter i prosjektet', v_limit
      using errcode = 'P0402', detail = 'units:' || v_limit;
  end if;
  return new;
end;
$$;

create trigger limit_launched_units before insert on public.units
  for each row execute function app.limit_launched_units();

-- Setter lanseringen på prosjektet etter en betaling eller et frafall. Et nivå
-- blir aldri mindre, og et prosjekt uten grense beholder det.
create function app.apply_launch(p_project_id uuid, p_unit_limit integer)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.projects
     set launch_unit_limit = case
           when launched_at is not null and launch_unit_limit is null then null
           when p_unit_limit is null then null
           else greatest(coalesce(launch_unit_limit, 0), p_unit_limit)
         end,
         launched_at = coalesce(launched_at, now())
   where id = p_project_id;
$$;

-- Gjør klar en betaling (service-rollen, etter at appen har sjekket at brukeren
-- er eier og at organisasjonen har en pakke). Appen regner ut nivå og beløp med
-- src/lib/billing/launch.ts. Eldre betalinger som venter, settes som utløpt.
create function public.begin_project_launch(
  p_project_id uuid,
  p_kind text,
  p_units integer,
  p_unit_limit integer,
  p_amount integer,
  p_currency text default 'nok',
  p_created_by uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project public.projects;
  v_id uuid;
begin
  if p_kind is null or p_kind not in ('launch', 'upgrade') then
    raise exception 'Ukjent type: %', p_kind using errcode = '22023';
  end if;
  if p_amount is null or p_amount <= 0 or p_unit_limit is null or p_unit_limit < greatest(p_units, 1) then
    raise exception 'Ugyldig beløp eller nivå' using errcode = '22023';
  end if;
  select * into v_project from public.projects p where p.id = p_project_id for update;
  if not found then
    raise exception 'Prosjektet finnes ikke' using errcode = 'P0002';
  end if;
  if p_kind = 'launch' and v_project.launched_at is not null then
    raise exception 'Prosjektet er allerede lansert' using errcode = '23505';
  end if;
  if p_kind = 'upgrade' and (
    v_project.launched_at is null
    or v_project.launch_unit_limit is null
    or p_unit_limit <= v_project.launch_unit_limit
  ) then
    raise exception 'Utvidelsen må gi et høyere nivå enn det som er betalt' using errcode = '22023';
  end if;

  update public.project_launches
     set status = 'expired'
   where project_id = p_project_id and status = 'pending';

  insert into public.project_launches (
    organization_id, project_id, kind, units, unit_limit, amount, currency, created_by
  )
  values (
    v_project.organization_id, v_project.id, p_kind, p_units, p_unit_limit, p_amount,
    lower(coalesce(p_currency, 'nok')), p_created_by
  )
  returning id into v_id;
  return v_id;
end;
$$;

-- Knytter Checkout-økten til betalingen, så returen og webhooken kan finne den.
create function public.attach_launch_checkout(p_launch_id uuid, p_session_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.project_launches
     set stripe_checkout_session_id = p_session_id
   where id = p_launch_id and status = 'pending' and stripe_checkout_session_id is null;
  if not found then
    raise exception 'Fant ingen betaling som venter' using errcode = 'P0002';
  end if;
end;
$$;

-- Registrerer en betaling fra Stripe (webhooken eller returen fra Checkout).
-- Kan kalles flere ganger for samme betaling. Beløpet (uten mva. og før
-- rabatt) må være det som ble satt da betalingen ble gjort klar. Svarer med
-- prosjektet, eller null når betalingen ikke finnes.
create function public.complete_project_launch(
  p_launch_id uuid,
  p_session_id text,
  p_amount integer,
  p_payment_intent_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_launch public.project_launches;
begin
  select * into v_launch from public.project_launches l where l.id = p_launch_id for update;
  if not found then
    return null;
  end if;
  if v_launch.status = 'paid' then
    return v_launch.project_id;
  end if;
  if v_launch.status not in ('pending', 'expired') then
    raise exception 'Betalingen kan ikke registreres (status %)', v_launch.status using errcode = '22023';
  end if;
  if v_launch.stripe_checkout_session_id is distinct from p_session_id then
    raise exception 'Checkout-økten hører ikke til betalingen' using errcode = '22023';
  end if;
  if p_amount is distinct from v_launch.amount then
    raise exception 'Beløpet stemmer ikke: % betalt, % ventet', p_amount, v_launch.amount using errcode = '22023';
  end if;

  update public.project_launches
     set status = 'paid', paid_at = now(), stripe_payment_intent_id = p_payment_intent_id
   where id = v_launch.id;
  perform app.apply_launch(v_launch.project_id, v_launch.unit_limit);

  perform app.write_audit(
    v_launch.organization_id, v_launch.project_id,
    case v_launch.kind when 'launch' then 'project.launched' else 'project.launch_extended' end,
    'project', v_launch.project_id,
    jsonb_build_object('units', v_launch.units, 'unit_limit', v_launch.unit_limit, 'amount', v_launch.amount,
                       'currency', v_launch.currency)
  );
  return v_launch.project_id;
end;
$$;

-- Lansering uten betaling (service-rollen): avtale for prosjekter med mer enn
-- 199 enheter, demo og support. p_unit_limit null betyr ingen grense.
create function public.waive_project_launch(
  p_project_id uuid,
  p_unit_limit integer default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project public.projects;
begin
  if p_unit_limit is not null and p_unit_limit < 1 then
    raise exception 'Ugyldig nivå' using errcode = '22023';
  end if;
  select * into v_project from public.projects p where p.id = p_project_id for update;
  if not found then
    raise exception 'Prosjektet finnes ikke' using errcode = 'P0002';
  end if;
  insert into public.project_launches (organization_id, project_id, kind, status, units, unit_limit, amount, note)
  values (
    v_project.organization_id, v_project.id, 'waiver', 'waived',
    (select count(*) from public.units u where u.project_id = v_project.id), p_unit_limit, 0,
    nullif(btrim(p_note), '')
  );
  perform app.apply_launch(v_project.id, p_unit_limit);
  perform app.write_audit(
    v_project.organization_id, v_project.id, 'project.launch_waived', 'project', v_project.id,
    jsonb_build_object('unit_limit', p_unit_limit, 'note', nullif(btrim(p_note), ''))
  );
end;
$$;

-- Prosjekter som allerede er publisert, regnes som lansert uten grense.
insert into public.project_launches (organization_id, project_id, kind, status, units, unit_limit, amount, note)
select p.organization_id, p.id, 'waiver', 'waived',
       (select count(*) from public.units u where u.project_id = p.id), null, 0,
       'Publisert før oppstartsavgiften ble innført'
from public.projects p
where app.project_is_public(p.id);
update public.projects p set launched_at = now() where app.project_is_public(p.id);

-- -----------------------------------------------------------------------------
-- Prosjektoversikten: lanseringen
-- -----------------------------------------------------------------------------

create or replace function public.project_overview(p_project_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'statuses', coalesce((
      select jsonb_agg(
        jsonb_build_object('status', s.status, 'units', s.units, 'value', s.value, 'unpriced', s.unpriced)
        order by s.status
      )
      from (
        select
          u.status,
          count(*) as units,
          coalesce(sum(u.price), 0) as value,
          count(*) filter (where u.price is null) as unpriced
        from public.units u
        where u.project_id = p_project_id
        group by u.status
      ) s
    ), '[]'::jsonb),
    'views_with_image', (
      select count(*) from public.selector_views v
      where v.project_id = p_project_id and v.asset_id is not null
    ),
    'marked_units', (
      select count(distinct h.target_unit_id) from public.hotspots h
      where h.project_id = p_project_id and h.target_type = 'unit'
    ),
    -- Den publiserte boligvelgeren hvis det finnes en, ellers den eldste.
    'selector', (
      select jsonb_build_object('id', s.id, 'published', s.published_at is not null)
      from public.selectors s
      where s.project_id = p_project_id
      order by s.published_at is null, s.created_at
      limit 1
    ),
    'site', (
      select jsonb_build_object('id', s.id, 'published', s.published_at is not null)
      from public.sites s
      where s.project_id = p_project_id
    ),
    'launch', (
      select jsonb_build_object('launched_at', p.launched_at, 'unit_limit', p.launch_unit_limit)
      from public.projects p
      where p.id = p_project_id
    )
  );
$$;

-- -----------------------------------------------------------------------------
-- Rettigheter
-- -----------------------------------------------------------------------------

grant execute on function
  app.plan_member_limit(text),
  app.plan_domain_limit(text),
  app.plan_allows(text, text)
to authenticated, service_role;

grant execute on function public.integration_allowed(text, uuid, uuid) to anon, authenticated, service_role;

grant execute on function
  public.begin_project_launch(uuid, text, integer, integer, integer, text, uuid),
  public.attach_launch_checkout(uuid, text),
  public.complete_project_launch(uuid, text, integer, text),
  public.waive_project_launch(uuid, integer, text)
to service_role;
