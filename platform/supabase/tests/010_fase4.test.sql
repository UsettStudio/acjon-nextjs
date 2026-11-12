-- =============================================================================
-- Fase 4: pakker, Stripe, varsler, prøveperiode, egne
-- domener, sporingskoder, API med nøkkel og webhooks
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');
select tests.seed_organization('b');

select plan(98);

-- -----------------------------------------------------------------------------
-- Pakker: antall prosjekter er ikke begrenset
-- -----------------------------------------------------------------------------
-- Grensen for aktive prosjekter fra fase 4 er erstattet av oppstartsavgiften per
-- prosjekt i fase 6 (se 012_fase6.test.sql).

update public.organizations set plan = 'start' where id = tests.id('a', 'org');
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format(
    $$ insert into public.projects (organization_id, name, slug, phase)
       select %L, 'Aktivt ' || n, 'aktivt-' || n, 'for_sale' from generate_series(1, 4) as n $$,
    tests.id('a', 'org'))),
  '00000',
  'Prosjektside (start): flere prosjekter kan være i salg samtidig'
);
select tests.logout();

select is(
  tests.sqlstate_of(format($$ update public.organizations set plan = 'gull' where id = %L $$, tests.id('a', 'org'))),
  '23514',
  'Ukjente pakker avvises'
);
select is(
  tests.sqlstate_of(format($$ update public.organizations set plan = 'growth' where id = %L $$, tests.id('a', 'org'))),
  '23514',
  'Vekst (growth) finnes ikke lenger'
);

-- -----------------------------------------------------------------------------
-- Stripe: bare service-rollen
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'owner'));
select is(
  tests.sqlstate_of(format($$ select public.link_stripe_customer(%L, 'cus_A1') $$, tests.id('a', 'org'))),
  '42501',
  'Eieren kan ikke koble organisasjonen til en Stripe-kunde direkte'
);
select is(
  tests.sqlstate_of($$ select public.apply_stripe_subscription('cus_A1', 'sub_A1', 'active', 'pro', null, null, false) $$),
  '42501',
  'Eieren kan ikke sette abonnementet selv'
);
select tests.logout();

select set_config('role', 'service_role', true);
select is(public.link_stripe_customer(tests.id('a', 'org'), 'cus_A1'), 'cus_A1', 'Serveren kobler organisasjonen til Stripe-kunden');
select is(
  public.link_stripe_customer(tests.id('a', 'org'), 'cus_A2'),
  'cus_A1',
  'En organisasjon som allerede har en kunde, beholder den'
);
select is(
  tests.sqlstate_of(format($$ select public.link_stripe_customer(%L, 'kunde') $$, tests.id('b', 'org'))),
  '22023',
  'Ugyldig kunde-id avvises'
);

select is(
  public.apply_stripe_subscription('cus_A1', 'sub_A1', 'active', 'pro', null, now() + interval '30 days', false, now()),
  tests.id('a', 'org'),
  'Abonnementet lagres på organisasjonen som har kunden'
);
select results_eq(
  format($$ select subscription_status::text, plan, stripe_subscription_id, billing_notices
            from public.organizations where id = %L $$, tests.id('a', 'org')),
  $$ values ('active', 'pro', 'sub_A1', '{}'::jsonb) $$,
  'Status, plan og abonnement er satt, og varslene er nullstilt'
);
select ok(
  exists (
    select 1 from public.audit_log
    where organization_id = tests.id('a', 'org') and action = 'organization.subscription_changed'
      and data ->> 'plan' = 'pro' and data ->> 'previous_plan' = 'start' and actor_type = 'system'
  ),
  'Endringen står i revisjonsloggen'
);
select is(
  public.apply_stripe_subscription('cus_A1', 'sub_A1', 'canceled', 'pro', null, null, false, now() - interval '1 hour'),
  null,
  'En eldre tilstand som kommer sent, ignoreres'
);
select is(
  public.apply_stripe_subscription('cus_A1', 'sub_A2', 'incomplete', 'pro', null, null, false, now()),
  null,
  'Et nytt abonnement som ikke er betalt, endrer ingenting'
);
select is(
  public.apply_stripe_subscription('cus_A1', 'sub_A0', 'canceled', 'start', null, null, false, now()),
  null,
  'Et gammelt abonnement som avsluttes, overskriver ikke det gjeldende'
);
select is(
  (select subscription_status::text from public.organizations where id = tests.id('a', 'org')),
  'active',
  'Organisasjonen er fortsatt aktiv'
);
select is(
  public.apply_stripe_subscription('cus_ukjent', 'sub_X', 'active', 'pro', null, null, false, now()),
  null,
  'Ukjent kunde gir ingen endring'
);
select is(
  tests.sqlstate_of($$ select public.apply_stripe_subscription('cus_A1', 'sub_A1', 'active', 'gull', null, null, false, now()) $$),
  '22023',
  'Ukjent plan avvises'
);

-- Avsluttet abonnement gir lesemodus. Databasen stopper da alle endringer.
select public.apply_stripe_subscription('cus_A1', 'sub_A1', 'canceled', 'pro', null, null, false, now());
select tests.logout();
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.affected_rows(format($$ update public.projects set name = 'Lesemodus' where id = %L $$, tests.id('a', 'project'))),
  '0',
  'Avsluttet abonnement: ingen endringer slipper gjennom'
);
select tests.logout();

select set_config('role', 'service_role', true);
select public.apply_stripe_subscription('cus_A1', 'sub_A1', 'active', 'pro', null, now() + interval '30 days', true, now());
select is(
  (select cancel_at_period_end from public.organizations where id = tests.id('a', 'org')),
  true,
  'Oppsigelse ved periodens slutt lagres'
);
select tests.logout();
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.affected_rows(format($$ update public.projects set name = 'Aktiv igjen' where id = %L $$, tests.id('a', 'project'))),
  '1',
  'Aktivt abonnement igjen: endringer er tillatt'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Varsler om prøveperioden og lesemodus
-- -----------------------------------------------------------------------------

update public.organizations set trial_ends_at = now() + interval '5 days' where id = tests.id('b', 'org');
select set_config('role', 'service_role', true);
select results_eq(
  format($$ select kind, recipients from public.due_billing_notices() where organization_id = %L $$, tests.id('b', 'org')),
  $$ values ('trial_7d', array['b-eier@example.test']) $$,
  'Sju dager før slutt: varsel til eieren'
);
select public.mark_billing_notice(tests.id('b', 'org'), 'trial_7d');
select is_empty(
  format($$ select 1 from public.due_billing_notices() where organization_id = %L $$, tests.id('b', 'org')),
  'Hvert varsel sendes én gang'
);
select tests.logout();

update public.organizations set trial_ends_at = now() + interval '12 hours' where id = tests.id('b', 'org');
select set_config('role', 'service_role', true);
select is(
  (select kind from public.due_billing_notices() where organization_id = tests.id('b', 'org')),
  'trial_1d',
  'Siste døgn: nytt varsel'
);
select tests.logout();

update public.organizations set trial_ends_at = now() - interval '1 hour' where id = tests.id('b', 'org');
select set_config('role', 'service_role', true);
select is(
  (select kind from public.due_billing_notices() where organization_id = tests.id('b', 'org')),
  'read_only',
  'Når prøveperioden er ute: varsel om lesemodus'
);
select is(
  tests.sqlstate_of(format($$ select public.mark_billing_notice(%L, 'ukjent') $$, tests.id('b', 'org'))),
  '22023',
  'Ukjente varsler avvises'
);
select public.apply_stripe_subscription('cus_A1', 'sub_A1', 'trialing', 'pro', now() + interval '3 days', null, false, now());
select is_empty(
  format($$ select 1 from public.due_billing_notices() where organization_id = %L $$, tests.id('a', 'org')),
  'Ingen varsler om prøveperioden når et abonnement i Stripe tar over'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Plattformadmin forlenger prøveperioden
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('b', 'owner'));
select is(
  tests.sqlstate_of(format($$ select public.extend_trial(%L, 14) $$, tests.id('b', 'org'))),
  '42501',
  'Bare plattformadmin kan forlenge prøveperioden'
);
select tests.logout();

select tests.create_user('support-fase4@example.test', 'Support') as support_id \gset
insert into public.platform_admins (user_id) values (:'support_id');
select tests.login_as(:'support_id');
select is(
  public.extend_trial(tests.id('b', 'org'), 14),
  now() + interval '14 days',
  'Prøveperioden forlenges fra i dag når den er ute'
);
select results_eq(
  format($$ select subscription_status::text, billing_notices from public.organizations where id = %L $$, tests.id('b', 'org')),
  $$ values ('trialing', '{}'::jsonb) $$,
  'Organisasjonen er i prøveperioden igjen, og varslene er nullstilt'
);
select is(
  tests.sqlstate_of(format($$ select public.extend_trial(%L, 14) $$, tests.id('a', 'org'))),
  '22023',
  'Ikke når organisasjonen har abonnement i Stripe'
);
select is(
  tests.sqlstate_of(format($$ select public.extend_trial(%L, 0) $$, tests.id('b', 'org'))),
  '22023',
  'Antall dager må være mellom 1 og 90'
);
select tests.logout();
select ok(
  exists (
    select 1 from public.audit_log
    where organization_id = tests.id('b', 'org') and action = 'organization.trial_extended'
      and actor_type = 'platform_admin' and (data ->> 'days')::int = 14
  ),
  'Forlengelsen logges med plattformadmin som aktør'
);

-- -----------------------------------------------------------------------------
-- Egne domener
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'admin'));
insert into public.domains (organization_id, project_id, site_id, hostname)
values (tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'site'), 'ny.a-prosjekt.test');
-- Vertsnavnet er allerede bekreftet på organisasjon B sin prosjektside.
insert into public.domains (organization_id, project_id, site_id, hostname)
values (tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'site'), 'www.b-prosjekt.test');
select is(
  tests.sqlstate_of(format(
    $$ select public.record_domain_check(id, 'verified', '[]') from public.domains where hostname = 'ny.a-prosjekt.test' $$)),
  '42501',
  'Innloggede brukere kan ikke bekrefte domener selv'
);
select tests.logout();

select set_config('role', 'service_role', true);
select is(
  public.record_domain_check(
    (select id from public.domains where hostname = 'ny.a-prosjekt.test'),
    'pending', '[{"type": "TXT", "ok": false}]', 'txt_missing'),
  'pending',
  'Sjekk uten TXT-post: domenet venter'
);
select results_eq(
  $$ select status, last_error, last_checked_at is not null, dns_records -> 0 ->> 'type'
     from public.domains where hostname = 'ny.a-prosjekt.test' $$,
  $$ values ('pending', 'txt_missing', true, 'TXT') $$,
  'Status, feil, tidspunkt og DNS-poster lagres'
);
select is(
  public.record_domain_check((select id from public.domains where hostname = 'ny.a-prosjekt.test'), 'verified', '[]'),
  'verified',
  'Riktig DNS: domenet er bekreftet'
);
select results_eq(
  $$ select status, verified_at is not null, is_primary, last_error from public.domains where hostname = 'ny.a-prosjekt.test' $$,
  $$ values ('verified', true, false, null::text) $$,
  'Bekreftet, men ikke primærdomene når prosjektsiden har et fra før'
);
select is(
  public.record_domain_check((select id from public.domains where hostname = 'ny.a-prosjekt.test'), 'misconfigured', '[]'),
  'verified',
  'En senere feil tar ikke ned et bekreftet domene'
);
select results_eq(
  $$ select status, verified_at is not null, last_error from public.domains where hostname = 'ny.a-prosjekt.test' $$,
  $$ values ('verified', true, 'misconfigured') $$,
  'Feilen lagres som varsel'
);
select is(
  public.record_domain_check(
    (select id from public.domains where hostname = 'www.b-prosjekt.test' and organization_id = tests.id('a', 'org')),
    'verified', '[]'),
  'error',
  'Et vertsnavn som er bekreftet et annet sted, kan ikke bekreftes på nytt'
);
select results_eq(
  format($$ select status, verified_at is null, last_error from public.domains
            where hostname = 'www.b-prosjekt.test' and organization_id = %L $$, tests.id('a', 'org')),
  $$ values ('error', true, 'hostname_taken') $$,
  'Domenet blir stående ubekreftet med feilen hostname_taken'
);
select is(
  tests.sqlstate_of($$ select public.record_domain_check(gen_random_uuid(), 'ok', '[]') $$),
  '22023',
  'Ukjent status avvises'
);
select is(
  tests.sqlstate_of($$ select public.record_domain_check(gen_random_uuid(), 'pending', '{}') $$),
  '22023',
  'DNS-postene må være en liste'
);
select ok(
  exists (
    select 1 from public.domains_due_for_check(200)
    where hostname = 'www.b-prosjekt.test' and organization_id = tests.id('b', 'org')
  )
  and not exists (
    select 1 from public.domains_due_for_check(200)
    where organization_id = tests.id('a', 'org') and hostname in ('ny.a-prosjekt.test', 'www.b-prosjekt.test')
  ),
  'Jobben sjekker domener som ikke er sjekket ennå, men ikke domener som nettopp er sjekket'
);
select tests.logout();

-- Primærdomene
select tests.login_as(tests.id('a', 'editor'));
select is(
  tests.sqlstate_of(format($$ select public.set_primary_domain(%L, null) $$, tests.id('a', 'site'))),
  '42501',
  'Redaktører kan ikke bytte primærdomene'
);
select tests.logout();
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format(
    $$ select public.set_primary_domain(%L, (select id from public.domains where hostname = 'www.b-prosjekt.test' and organization_id = %L)) $$,
    tests.id('a', 'site'), tests.id('a', 'org'))),
  '22023',
  'Et ubekreftet domene kan ikke være primærdomene'
);
select public.set_primary_domain(tests.id('a', 'site'), (select id from public.domains where hostname = 'ny.a-prosjekt.test'));
select results_eq(
  format($$ select hostname from public.domains where site_id = %L and is_primary $$, tests.id('a', 'site')),
  $$ values ('ny.a-prosjekt.test') $$,
  'Primærdomenet byttes, og det finnes bare ett'
);
select public.set_primary_domain(tests.id('a', 'site'), null);
select is_empty(
  format($$ select 1 from public.domains where site_id = %L and is_primary $$, tests.id('a', 'site')),
  'Uten primærdomene er underdomenet hovedadressen'
);
insert into public.domains (organization_id, project_id, site_id, hostname)
values (tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'site'), 'auto.a-prosjekt.test');
select tests.logout();
select set_config('role', 'service_role', true);
select public.record_domain_check((select id from public.domains where hostname = 'auto.a-prosjekt.test'), 'verified', '[]');
select is(
  (select is_primary from public.domains where hostname = 'auto.a-prosjekt.test'),
  true,
  'Første bekreftede domene på en side uten primærdomene blir primærdomene'
);
select tests.logout();

-- Inntil ti domener per prosjektside (siden har fire nå).
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format(
    $$ insert into public.domains (organization_id, project_id, site_id, hostname)
       select %L, %L, %L, 'd' || g || '.a-prosjekt.test' from generate_series(1, 6) as g $$,
    tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'site'))),
  '00000',
  'Prosjektsiden kan ha ti domener'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.domains (organization_id, project_id, site_id, hostname) values (%L, %L, %L, 'elleve.a-prosjekt.test') $$,
    tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'site'))),
  'P0413',
  'Det ellevte avvises'
);

-- -----------------------------------------------------------------------------
-- Sporingskoder
-- -----------------------------------------------------------------------------

select is(
  tests.sqlstate_of(format(
    $$ update public.projects set analytics_ids = '{"ga4": "G-ABC123XYZ", "gtm": "GTM-ABCD12", "meta_pixel": "1234567890"}'
       where id = %L $$, tests.id('a', 'project'))),
  '00000',
  'Gyldige koder for GA4, Tag Manager og Meta Pixel lagres'
);
select is(
  tests.sqlstate_of(format(
    $$ update public.projects set analytics_ids = '{"ga4": "G-1'');alert(1)//"}' where id = %L $$, tests.id('a', 'project'))),
  '23514',
  'Kode med skript avvises'
);
select is(
  tests.sqlstate_of(format($$ update public.projects set analytics_ids = '{"tiktok": "123456"}' where id = %L $$, tests.id('a', 'project'))),
  '23514',
  'Ukjente sporingstjenester avvises'
);
select is(
  tests.sqlstate_of(format($$ update public.projects set analytics_ids = '{"meta_pixel": 1234567890}' where id = %L $$, tests.id('a', 'project'))),
  '23514',
  'Kodene må være tekst'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- API med nøkkel
-- -----------------------------------------------------------------------------

-- Nøkler: den fra seed (bare units:read), én med alle tilganger, én trukket tilbake og én utløpt.
insert into public.api_keys (organization_id, name, key_prefix, key_hash, scopes, revoked_at, expires_at)
values
  (tests.id('a', 'org'), 'Alt', 'pk_full_a', encode(sha256(convert_to('full-a', 'UTF8')), 'hex'),
   '{units:read,units:write,projects:read,leads:read}', null, null),
  (tests.id('a', 'org'), 'Gammel', 'pk_old_a', encode(sha256(convert_to('revoked-a', 'UTF8')), 'hex'),
   '{units:read}', now(), null),
  (tests.id('a', 'org'), 'Utløpt', 'pk_exp_a', encode(sha256(convert_to('expired-a', 'UTF8')), 'hex'),
   '{units:read}', null, now() - interval '1 minute');
create temporary table nokler (navn text primary key, hash text) on commit drop;
insert into nokler
select n, encode(sha256(convert_to(n, 'UTF8')), 'hex')
from unnest(array['api-a', 'full-a', 'revoked-a', 'expired-a', 'ukjent']) as n;
grant select on nokler to anon, authenticated, service_role;

select tests.login_as(tests.id('a', 'owner'));
select is(
  tests.sqlstate_of(format($$ select public.api_units((select hash from nokler where navn = 'full-a'), %L) $$, tests.id('a', 'project'))),
  '42501',
  'Innloggede brukere kan ikke kalle API-funksjonene direkte'
);
select tests.logout();
select tests.login_as_anon();
select is(
  tests.sqlstate_of($$ select public.api_projects((select hash from nokler where navn = 'full-a')) $$),
  '42501',
  'Heller ikke anon'
);
select tests.logout();

select set_config('role', 'service_role', true);
select is(
  tests.sqlstate_of(format($$ select public.api_units((select hash from nokler where navn = 'ukjent'), %L) $$, tests.id('a', 'project'))),
  '28000',
  'Ukjent nøkkel avvises'
);
select is(
  tests.sqlstate_of(format($$ select public.api_units((select hash from nokler where navn = 'revoked-a'), %L) $$, tests.id('a', 'project'))),
  '28000',
  'Nøkkel som er trukket tilbake, avvises'
);
select is(
  tests.sqlstate_of(format($$ select public.api_units((select hash from nokler where navn = 'expired-a'), %L) $$, tests.id('a', 'project'))),
  '28000',
  'Utløpt nøkkel avvises'
);
select is(
  tests.sqlstate_of($$ select public.api_projects((select hash from nokler where navn = 'api-a')) $$),
  '42501',
  'Nøkkel uten tilgangen projects:read avvises'
);

select results_eq(
  format($$ select u ->> 'unit_number', (u ->> 'is_hidden')::boolean, u ->> 'external_id'
            from jsonb_array_elements(public.api_units((select hash from nokler where navn = 'api-a'), %L)) as u
            order by 1 $$, tests.id('a', 'project')),
  $$ values ('A-101', false, 'EKSTERN-ID-HEMMELIG'), ('A-302', false, null), ('A-303', true, null) $$,
  'API-et gir alle enheter i prosjektet, også skjulte, med ekstern id'
);
select is(
  tests.sqlstate_of(format($$ select public.api_units((select hash from nokler where navn = 'api-a'), %L) $$, tests.id('b', 'project'))),
  'P0002',
  'En annen organisasjons prosjekt finnes ikke for nøkkelen'
);
select ok(
  (select bool_and(p.organization_id = tests.id('a', 'org'))
   from jsonb_array_elements(public.api_projects((select hash from nokler where navn = 'full-a'))) as item
   join public.projects p on p.id = (item ->> 'id')::uuid)
  and jsonb_array_length(public.api_projects((select hash from nokler where navn = 'full-a'))) =
      (select count(*) from public.projects where organization_id = tests.id('a', 'org')),
  'Prosjektlisten har alle prosjektene i nøkkelens organisasjon og ingen andre'
);
select ok(
  (select last_used_at is not null from public.api_keys where key_prefix = 'pk_full_a'),
  'Nøkkelen får tidspunkt for siste bruk'
);

select is(
  public.api_update_unit(
    (select hash from nokler where navn = 'full-a'), tests.id('a', 'project'), 'A-101',
    '{"status": "sold", "note": "Solgt via meglersystemet"}') ->> 'status',
  'sold',
  'Status endres med API-et, enheten oppgis med enhetsnummer'
);
select results_eq(
  format($$ select to_status::text, changed_by is null, note from public.unit_status_events
            where unit_id = %L and source = 'api' $$, tests.id('a', 'unit_available')),
  $$ values ('sold', true, 'Solgt via meglersystemet') $$,
  'Statusloggen får kilden «api» og notatet'
);
select ok(
  exists (
    select 1 from public.audit_log l
    join public.api_keys k on k.id = (l.data ->> 'api_key_id')::uuid
    where l.organization_id = tests.id('a', 'org') and l.action = 'unit.status_changed'
      and l.actor_type = 'api_key' and k.key_prefix = 'pk_full_a'
  ),
  'Revisjonsloggen viser API-nøkkelen som aktør'
);
select ok(
  exists (
    select 1 from public.webhook_deliveries
    where organization_id = tests.id('a', 'org') and event = 'unit.status_changed'
      and payload -> 'data' ->> 'to_status' = 'sold'
      and payload -> 'data' ->> 'external_id' = 'EKSTERN-ID-HEMMELIG'
      and payload -> 'data' ->> 'source' = 'api'
  ),
  'Webhooken får hendelsen med ekstern id og kilde'
);
select is(current_setting('app.api_key_id', true), '', 'Nøkkelen gjelder bare for selve endringen');
select is(
  public.api_update_unit(
    (select hash from nokler where navn = 'full-a'), tests.id('a', 'project'), tests.id('a', 'unit_sold')::text,
    '{"price": 7100000, "monthly_fee": null}') ->> 'price',
  '7100000',
  'Pris endres, enheten oppgis med id'
);
select is(
  tests.sqlstate_of(format($$ select public.api_update_unit((select hash from nokler where navn = 'full-a'), %L, 'A-101', '{"description": "x"}') $$,
    tests.id('a', 'project'))),
  '22023',
  'Andre felt enn status og pris avvises'
);
select is(
  tests.sqlstate_of(format($$ select public.api_update_unit((select hash from nokler where navn = 'full-a'), %L, 'A-101', '{"price": -1}') $$,
    tests.id('a', 'project'))),
  '22023',
  'Negativ pris avvises'
);
select is(
  tests.sqlstate_of(format($$ select public.api_update_unit((select hash from nokler where navn = 'full-a'), %L, 'A-101', '{"price": "100"}') $$,
    tests.id('a', 'project'))),
  '22023',
  'Pris som tekst avvises'
);
select is(
  tests.sqlstate_of(format($$ select public.api_update_unit((select hash from nokler where navn = 'full-a'), %L, 'A-101', '{"price": 10.5}') $$,
    tests.id('a', 'project'))),
  '22023',
  'Pris med desimaler avvises'
);
select is(
  tests.sqlstate_of(format($$ select public.api_update_unit((select hash from nokler where navn = 'full-a'), %L, 'A-101', '{"status": "booked"}') $$,
    tests.id('a', 'project'))),
  '22023',
  'Ukjent status avvises'
);
select is(
  tests.sqlstate_of(format($$ select public.api_update_unit((select hash from nokler where navn = 'full-a'), %L, 'A-101', '{"status": "sold"}') $$,
    tests.id('b', 'project'))),
  'P0002',
  'Enheter i en annen organisasjon finnes ikke for nøkkelen'
);
select is(
  tests.sqlstate_of(format($$ select public.api_update_unit((select hash from nokler where navn = 'api-a'), %L, 'A-101', '{"status": "sold"}') $$,
    tests.id('a', 'project'))),
  '42501',
  'Nøkkel uten units:write kan ikke endre'
);
select tests.logout();
update public.organizations set subscription_status = 'canceled' where id = tests.id('a', 'org');
select set_config('role', 'service_role', true);
select is(
  tests.sqlstate_of(format($$ select public.api_update_unit((select hash from nokler where navn = 'full-a'), %L, 'A-101', '{"status": "available"}') $$,
    tests.id('a', 'project'))),
  '25006',
  'Lesemodus: API-et kan ikke endre'
);
select is(
  jsonb_array_length(public.api_units((select hash from nokler where navn = 'full-a'), tests.id('a', 'project'))),
  3,
  'Lesemodus: API-et kan fortsatt lese'
);
select tests.logout();
update public.organizations set subscription_status = 'active' where id = tests.id('a', 'org');
select set_config('role', 'service_role', true);

select is(
  (select array_agg(l ->> 'email' order by l ->> 'email')
   from jsonb_array_elements(public.api_leads((select hash from nokler where navn = 'full-a'))) as l),
  array['a-kari@example.test'],
  'API-et gir leads fra nøkkelens organisasjon, og ingen andre'
);
select ok(
  not (public.api_leads((select hash from nokler where navn = 'full-a')) -> 0 ? 'internal_note'),
  'Internt notat er ikke med'
);
select is(
  public.api_leads((select hash from nokler where navn = 'full-a'), null, now()),
  '[]'::jsonb,
  'Med «since» kommer bare nyere leads'
);
select is(
  tests.sqlstate_of($$ select public.api_leads((select hash from nokler where navn = 'api-a')) $$),
  '42501',
  'Nøkkel uten leads:read får ikke leads'
);
select tests.logout();

-- Rate limit: 600 kall per minutt per nøkkel. now() er fast i testtransaksjonen.
insert into public.rate_limit_buckets (organization_id, key, window_start, hits)
select tests.id('a', 'org'), 'api:' || k.id::text, to_timestamp(floor(extract(epoch from now()) / 60) * 60), 600
from public.api_keys k where k.key_prefix = 'pk_full_a'
on conflict (organization_id, key, window_start) do update set hits = 600;
select set_config('role', 'service_role', true);
select is(
  tests.sqlstate_of($$ select public.api_projects((select hash from nokler where navn = 'full-a')) $$),
  'P0429',
  'Over 600 kall i minuttet avvises'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Webhooks
-- -----------------------------------------------------------------------------

select ok(
  exists (
    select 1 from public.webhook_deliveries
    where organization_id = tests.id('a', 'org') and event = 'lead.created'
      and payload -> 'data' ->> 'unit_external_id' = 'EKSTERN-ID-HEMMELIG'
  ),
  'lead.created har enhetens eksterne id'
);

select tests.login_as(tests.id('a', 'editor'));
select is(
  tests.sqlstate_of(format($$ select public.send_test_webhook(%L) $$, tests.id('a', 'webhook'))),
  '42501',
  'Redaktører kan ikke sende testhendelser'
);
select tests.logout();
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format($$ select public.send_test_webhook(%L) $$, tests.id('b', 'webhook'))),
  '42501',
  'En annen organisasjons webhook avvises'
);
select public.send_test_webhook(tests.id('a', 'webhook')) as test_delivery \gset
select tests.logout();

select set_config('role', 'service_role', true);
select results_eq(
  format($$ select event, url, attempt from public.claim_webhook_delivery(%L) $$, :'test_delivery'),
  $$ values ('webhook.test', 'https://hooks.example.test/a', 1) $$,
  'Testhendelsen kan sendes med en gang'
);
select is_empty(
  format($$ select 1 from public.claim_webhook_delivery(%L) $$, :'test_delivery'),
  'Den kan ikke hentes to ganger samtidig'
);
select public.complete_webhook_delivery(:'test_delivery', false, 500, 'Serverfeil');
select is(
  (select status from public.webhook_deliveries where id = :'test_delivery'),
  'failed',
  'En testhendelse som feiler, prøves ikke igjen'
);
select tests.logout();

select tests.login_as(tests.id('a', 'admin'));
select public.retry_webhook_delivery(:'test_delivery');
select tests.logout();
select results_eq(
  format($$ select status, attempts, last_error from public.webhook_deliveries where id = %L $$, :'test_delivery'),
  $$ values ('pending', 0, null::text) $$,
  '«Prøv igjen» legger leveransen i kø på nytt'
);
select set_config('role', 'service_role', true);
select public.claim_webhook_delivery(:'test_delivery');
select public.complete_webhook_delivery(:'test_delivery', true, 204);
select tests.logout();
select id as b_delivery from public.webhook_deliveries where webhook_id = tests.id('b', 'webhook') limit 1 \gset
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format($$ select public.retry_webhook_delivery(%L) $$, :'test_delivery')),
  '22023',
  'En levert hendelse kan ikke sendes på nytt'
);
select is(
  tests.sqlstate_of(format($$ select public.retry_webhook_delivery(%L) $$, :'b_delivery')),
  '42501',
  'En annen organisasjons leveranse avvises'
);
select tests.logout();

-- En webhook som er slått av, får ikke leveranser før den slås på igjen.
update public.webhooks set is_active = false where id = tests.id('a', 'webhook');
select set_config('role', 'service_role', true);
create temporary table hentet on commit drop as select * from public.claim_webhook_deliveries(100);
select ok(
  not exists (select 1 from hentet where webhook_id = tests.id('a', 'webhook'))
    and exists (select 1 from hentet where webhook_id = tests.id('b', 'webhook')),
  'Utsendingen hopper over webhooks som er slått av'
);
select public.complete_webhook_delivery(
  (select delivery_id from hentet where webhook_id = tests.id('b', 'webhook') order by delivery_id limit 1), false, 503, 'Opptatt');
select results_eq(
  format($$ select status, next_attempt_at > now() from public.webhook_deliveries where id = %L $$,
    (select delivery_id from hentet where webhook_id = tests.id('b', 'webhook') order by delivery_id limit 1)),
  $$ values ('pending', true) $$,
  'En vanlig leveranse som feiler, prøves igjen senere'
);
select tests.logout();

-- Daglig vedlikehold: leveranser som har ventet i tre døgn, går ut.
update public.webhook_deliveries
   set created_at = now() - interval '4 days'
 where webhook_id = tests.id('a', 'webhook') and status = 'pending';
select ok(
  (app.run_daily_maintenance() ->> 'webhook_deliveries_expired')::int > 0,
  'Vedlikeholdet gir opp gamle leveranser'
);
select is_empty(
  format($$ select 1 from public.webhook_deliveries where webhook_id = %L and status = 'pending' $$, tests.id('a', 'webhook')),
  'Ingen leveranser venter lenger på webhooken som er slått av'
);

select * from finish();
rollback;
