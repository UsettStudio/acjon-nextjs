-- =============================================================================
-- Fase 6: pakker (brukere, domener, API, webhooks og innbygging) og
-- oppstartsavgift per prosjekt (lansering før publisering)
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');
select tests.seed_organization('b');

select plan(65);

-- -----------------------------------------------------------------------------
-- Pakkene
-- -----------------------------------------------------------------------------

select results_eq(
  $$ select app.plan_member_limit(p), app.plan_domain_limit(p), app.plan_allows(p, 'api'),
            app.plan_allows(p, 'webhooks'), app.plan_allows(p, 'embed')
     from unnest(array['trial', 'start', 'pro', 'partner', 'enterprise', 'ukjent']) as p $$,
  $$ values (10, 10, true, true, true),
            (3, 1, false, false, false),
            (10, 10, true, true, true),
            (null::integer, 10, true, true, true),
            (null::integer, 10, true, true, true),
            (3, 1, false, false, false) $$,
  'Grenser og funksjoner per pakke: prøveperiode og Pro 10 brukere, Prosjektside 3 brukere og 1 domene uten integrasjoner, Partner uten grense'
);
select is(app.plan_allows('pro', 'tilvalg'), false, 'Ukjente funksjoner er ikke med i noen pakke');

select set_config('role', 'service_role', true);
select public.link_stripe_customer(tests.id('a', 'org'), 'cus_A6');
select is(
  public.apply_stripe_subscription('cus_A6', 'sub_A6', 'active', 'partner', null, now() + interval '30 days', false, now()),
  tests.id('a', 'org'),
  'Partner kan settes fra Stripe'
);
select is(
  tests.sqlstate_of($$ select public.apply_stripe_subscription('cus_A6', 'sub_A6', 'active', 'growth', null, null, false, now()) $$),
  '22023',
  'Vekst (growth) avvises fra Stripe'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Brukere: Prosjektside har plass til tre
-- -----------------------------------------------------------------------------
-- Organisasjon A har fire medlemmer (eier, admin, redaktør, megler) og én
-- ventende invitasjon fra testdataene.

update public.organizations set plan = 'start' where id = tests.id('a', 'org');
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format(
    $$ insert into public.invitations (organization_id, email, role, token_hash, expires_at)
       values (%L, 'fem@example.test', 'editor', repeat('a', 64), now() + interval '7 days') $$,
    tests.id('a', 'org'))),
  'P0413',
  'Prosjektside: en ny invitasjon avvises når pakken er full'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.invitations (organization_id, email, role, project_ids, token_hash, expires_at)
       values (%L, 'a-redaktor@example.test', 'editor', array[%L]::uuid[], repeat('b', 64), now() + interval '7 days') $$,
    tests.id('a', 'org'), tests.id('a', 'project_other'))),
  '00000',
  'En invitasjon til et medlem (tilgang til flere prosjekter) tar ikke en ny plass'
);
select is(
  tests.affected_rows(format($$ update public.memberships set role = 'editor' where organization_id = %L and user_id = %L $$,
    tests.id('a', 'org'), tests.id('a', 'agent'))),
  '1',
  'Medlemmene som er der, beholdes og kan endres'
);
select tests.logout();

select tests.create_user('a-ny@example.test', 'Ny bruker');
select tests.login_as((select id from auth.users where email = 'a-ny@example.test'));
select is(
  tests.sqlstate_of($$ select public.accept_invitation('invitasjon-a') $$),
  'P0413',
  'En ventende invitasjon kan ikke godtas når pakken er full'
);
select tests.logout();

update public.organizations set plan = 'partner' where id = tests.id('a', 'org');
select tests.login_as((select id from auth.users where email = 'a-ny@example.test'));
select is(
  public.accept_invitation('invitasjon-a'),
  tests.id('a', 'org'),
  'Partner har ingen grense: invitasjonen kan godtas'
);
select tests.logout();
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format(
    $$ insert into public.invitations (organization_id, email, role, token_hash, expires_at)
       select %L, 'bruker' || n || '@example.test', 'editor', repeat(n::text, 64), now() + interval '7 days'
       from generate_series(1, 8) as n $$,
    tests.id('a', 'org'))),
  '00000',
  'Partner: mange invitasjoner er lov'
);
select tests.logout();

update public.organizations set plan = 'pro' where id = tests.id('a', 'org');
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format(
    $$ insert into public.invitations (organization_id, email, role, token_hash, expires_at)
       values (%L, 'elleve@example.test', 'editor', repeat('c', 64), now() + interval '7 days') $$,
    tests.id('a', 'org'))),
  'P0413',
  'Pro: fem medlemmer og åtte ventende invitasjoner fyller de ti plassene'
);
select is(
  tests.affected_rows(format(
    $$ update public.invitations set revoked_at = now() where organization_id = %L and email like 'bruker%%' $$,
    tests.id('a', 'org'))),
  '8',
  'Invitasjoner kan trekkes tilbake når pakken er full'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.invitations (organization_id, email, role, token_hash, expires_at)
       values (%L, 'elleve@example.test', 'editor', repeat('c', 64), now() + interval '7 days') $$,
    tests.id('a', 'org'))),
  '00000',
  'Tilbaketrukne invitasjoner frigjør plassene'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Egne domener: Prosjektside har ett per prosjektside
-- -----------------------------------------------------------------------------

update public.organizations set plan = 'start' where id = tests.id('a', 'org');
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format(
    $$ insert into public.domains (organization_id, project_id, site_id, hostname) values (%L, %L, %L, 'to.a-prosjekt.test') $$,
    tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'site'))),
  'P0413',
  'Prosjektside: domene nummer to avvises'
);
select tests.logout();
update public.organizations set plan = 'pro' where id = tests.id('a', 'org');
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format(
    $$ insert into public.domains (organization_id, project_id, site_id, hostname) values (%L, %L, %L, 'to.a-prosjekt.test') $$,
    tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'site'))),
  '00000',
  'Pro: flere domener er lov'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- API, webhooks og innbygging: ikke med i Prosjektside
-- -----------------------------------------------------------------------------

update public.organizations set plan = 'start' where id = tests.id('a', 'org');
select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format(
    $$ insert into public.api_keys (organization_id, name, key_prefix, key_hash, scopes)
       values (%L, 'Ny', 'pk_ny', repeat('d', 64), '{units:read}') $$,
    tests.id('a', 'org'))),
  'P0403',
  'Prosjektside: nye API-nøkler avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.webhooks (organization_id, url, events, secret)
       values (%L, 'https://hooks.example.test/ny', '{lead.created}', repeat('s', 40)) $$,
    tests.id('a', 'org'))),
  'P0403',
  'Prosjektside: nye webhooks avvises'
);
select is(
  tests.sqlstate_of(format($$ select public.send_test_webhook(%L) $$, tests.id('a', 'webhook'))),
  'P0403',
  'Prosjektside: testhendelser avvises'
);
select is(
  tests.affected_rows(format($$ update public.webhooks set description = 'Fortsatt her' where id = %L $$, tests.id('a', 'webhook'))),
  '1',
  'Webhooks som finnes, kan fortsatt endres og slettes'
);
select tests.logout();

select set_config('role', 'service_role', true);
select is(
  tests.sqlstate_of(format($$ select public.api_units(%L, %L, null) $$,
    encode(sha256(convert_to('api-a', 'UTF8')), 'hex'), tests.id('a', 'project'))),
  'P0403',
  'Prosjektside: API-nøkler som finnes, slutter å virke'
);
select is(
  tests.sqlstate_of(format($$ select public.api_units(%L, %L, null) $$,
    encode(sha256(convert_to('api-b', 'UTF8')), 'hex'), tests.id('b', 'project'))),
  '00000',
  'Organisasjon B (prøveperiode) bruker fortsatt API-et'
);
select tests.logout();

create temp table deliveries_before on commit drop as
select count(*)::integer as n from public.webhook_deliveries
where organization_id = tests.id('a', 'org') and event = 'unit.status_changed';

select tests.login_as(tests.id('a', 'owner'));
select public.set_unit_status(array[tests.id('a', 'unit_available')], 'reserved', null, 'table');
select tests.logout();
select is(
  (select count(*)::integer from public.webhook_deliveries
   where organization_id = tests.id('a', 'org') and event = 'unit.status_changed'),
  (select n from deliveries_before),
  'Prosjektside: hendelser legges ikke i utboksen'
);

select tests.login_as_anon();
select is(public.integration_allowed('embed', tests.id('a', 'selector')), false, 'Prosjektside: boligvelgeren kan ikke bygges inn');
select is(public.integration_allowed('api', null, tests.id('a', 'project')), false, 'Prosjektside: ikke det offentlige lese-API-et');
select is(public.integration_allowed('embed', tests.id('b', 'selector')), true, 'Prøveperioden: innbygging er med');
select is(public.integration_allowed('api', null, tests.id('b', 'project')), true, 'Prøveperioden: det offentlige lese-API-et er med');
select is(public.integration_allowed('tilvalg', tests.id('b', 'selector')), false, 'Ukjente funksjoner gir false');
select is(public.integration_allowed('api', null, tests.id('b', 'project_other')), false, 'Upubliserte prosjekter gir false');
select is(public.integration_allowed('embed', gen_random_uuid()), false, 'Ukjente boligvelgere gir false');
select tests.logout();

update public.organizations set plan = 'pro' where id = tests.id('a', 'org');
select tests.login_as(tests.id('a', 'owner'));
select public.set_unit_status(array[tests.id('a', 'unit_available')], 'available', null, 'table');
select tests.logout();
select ok(
  (select count(*)::integer from public.webhook_deliveries
   where organization_id = tests.id('a', 'org') and event = 'unit.status_changed') > (select n from deliveries_before),
  'Pro: hendelsene sendes igjen'
);

-- -----------------------------------------------------------------------------
-- Lansering: publisering krever betalt oppstartsavgift
-- -----------------------------------------------------------------------------

select ok(
  (select launched_at is not null and launch_unit_limit is null from public.projects where id = tests.id('a', 'project')),
  'Prosjektet i testdataene er lansert uten grense (frafall)'
);

-- Et nytt prosjekt med en prosjektside og to enheter, ikke lansert.
create temp table launch_fixture on commit drop as
select gen_random_uuid() as project_id, gen_random_uuid() as site_id;
grant select on launch_fixture to authenticated, service_role;

insert into public.projects (id, organization_id, name, slug, phase)
select project_id, tests.id('a', 'org'), 'Lansering', 'lansering', 'coming_soon' from launch_fixture;
insert into public.units (organization_id, project_id, unit_number)
select tests.id('a', 'org'), project_id, 'L-' || n from launch_fixture, generate_series(1, 2) as n;
insert into public.sites (id, organization_id, project_id, subdomain)
select site_id, tests.id('a', 'org'), project_id, 'lansering-a' from launch_fixture;
insert into public.pages (organization_id, project_id, site_id, title, slug, is_home)
select tests.id('a', 'org'), project_id, site_id, 'Forside', 'forside', true from launch_fixture;

select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of($$ select public.publish_site((select site_id from launch_fixture)) $$),
  'P0402',
  'Et prosjekt som ikke er lansert, kan ikke publiseres'
);
select is(
  tests.sqlstate_of($$ update public.projects set launched_at = now() where id = (select project_id from launch_fixture) $$),
  '42501',
  'Brukere kan ikke sette lanseringen selv'
);
select is(
  tests.sqlstate_of($$ select public.begin_project_launch((select project_id from launch_fixture), 'launch', 2, 9, 690000, 'nok', null) $$),
  '42501',
  'Brukere kan ikke gjøre klar en betaling'
);
select is(
  tests.sqlstate_of($$ select public.waive_project_launch((select project_id from launch_fixture)) $$),
  '42501',
  'Brukere kan ikke frafalle avgiften'
);
select is(
  tests.sqlstate_of($$ select public.unpublish_site((select site_id from launch_fixture)) $$),
  '00000',
  'Avpublisering er alltid lov'
);
select tests.logout();

select set_config('role', 'service_role', true);
select is(
  tests.sqlstate_of($$ select public.begin_project_launch((select project_id from launch_fixture), 'launch', 2, 9, 0, 'nok', null) $$),
  '22023',
  'Beløpet må være større enn null'
);
select is(
  tests.sqlstate_of($$ select public.begin_project_launch((select project_id from launch_fixture), 'launch', 12, 9, 690000, 'nok', null) $$),
  '22023',
  'Nivået må dekke enhetene'
);
select is(
  tests.sqlstate_of($$ select public.begin_project_launch((select project_id from launch_fixture), 'upgrade', 2, 19, 500000, 'nok', null) $$),
  '22023',
  'Et prosjekt som ikke er lansert, kan ikke utvides'
);

create temp table launch_ids (name text primary key, id uuid) on commit drop;
grant select, insert on launch_ids to service_role;
insert into launch_ids
select 'first', public.begin_project_launch((select project_id from launch_fixture), 'launch', 2, 9, 690000, 'nok', tests.id('a', 'owner'));
insert into launch_ids
select 'second', public.begin_project_launch((select project_id from launch_fixture), 'launch', 2, 9, 690000, 'nok', tests.id('a', 'owner'));
select is(
  (select status from public.project_launches where id = (select id from launch_ids where name = 'first')),
  'expired',
  'En ny betaling setter den forrige som venter, som utløpt'
);
select public.attach_launch_checkout((select id from launch_ids where name = 'second'), 'cs_test_andre');
select is(
  tests.sqlstate_of($$ select public.attach_launch_checkout((select id from launch_ids where name = 'second'), 'cs_test_tredje') $$),
  'P0002',
  'En betaling får bare én Checkout-økt'
);
select is(
  tests.sqlstate_of($$ select public.complete_project_launch((select id from launch_ids where name = 'second'), 'cs_test_feil', 690000, 'pi_test_1') $$),
  '22023',
  'Feil Checkout-økt avvises'
);
select is(
  tests.sqlstate_of($$ select public.complete_project_launch((select id from launch_ids where name = 'second'), 'cs_test_andre', 100, 'pi_test_1') $$),
  '22023',
  'Feil beløp avvises'
);
select is(
  public.complete_project_launch((select id from launch_ids where name = 'second'), 'cs_test_andre', 690000, 'pi_test_1'),
  (select project_id from launch_fixture),
  'Betalingen registreres'
);
select results_eq(
  $$ select launched_at is not null, launch_unit_limit from public.projects where id = (select project_id from launch_fixture) $$,
  $$ values (true, 9) $$,
  'Prosjektet er lansert, og avgiften dekker inntil ni enheter'
);
select is(
  public.complete_project_launch((select id from launch_ids where name = 'second'), 'cs_test_andre', 690000, 'pi_test_1'),
  (select project_id from launch_fixture),
  'Samme betaling kan registreres flere ganger (webhook og retur)'
);
select is(
  public.complete_project_launch(gen_random_uuid(), 'cs_test_x', 1),
  null,
  'En ukjent betaling gir null'
);
select is(
  tests.sqlstate_of($$ select public.begin_project_launch((select project_id from launch_fixture), 'launch', 2, 9, 690000, 'nok', null) $$),
  '23505',
  'Et lansert prosjekt lanseres ikke på nytt'
);
select tests.logout();

select ok(
  exists (
    select 1 from public.audit_log
    where project_id = (select project_id from launch_fixture) and action = 'project.launched'
      and (data ->> 'unit_limit')::integer = 9 and (data ->> 'amount')::integer = 690000
  ),
  'Lanseringen står i revisjonsloggen'
);

select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of($$ select public.publish_site((select site_id from launch_fixture)) $$),
  '00000',
  'Et lansert prosjekt kan publiseres'
);
select is(
  tests.sqlstate_of(
    $$ insert into public.units (organization_id, project_id, unit_number)
       select organization_id, id, 'L-' || n from public.projects, generate_series(3, 9) as n
       where id = (select project_id from launch_fixture) $$),
  '00000',
  'Enheter kan legges til opp til nivået som er betalt'
);
select is(
  tests.sqlstate_of(
    $$ insert into public.units (organization_id, project_id, unit_number)
       select organization_id, id, 'L-10' from public.projects where id = (select project_id from launch_fixture) $$),
  'P0402',
  'Enhet nummer ti krever utvidelse'
);
select is(
  (select (public.project_overview((select project_id from launch_fixture)) -> 'launch' ->> 'unit_limit')::integer),
  9,
  'Prosjektoversikten viser nivået som er betalt'
);
select tests.logout();

-- Utvidelse til neste nivå.
select set_config('role', 'service_role', true);
select is(
  tests.sqlstate_of($$ select public.begin_project_launch((select project_id from launch_fixture), 'upgrade', 9, 9, 500000, 'nok', null) $$),
  '22023',
  'En utvidelse må gi et høyere nivå'
);
insert into launch_ids
select 'upgrade', public.begin_project_launch((select project_id from launch_fixture), 'upgrade', 10, 19, 500000, 'nok', null);
select public.attach_launch_checkout((select id from launch_ids where name = 'upgrade'), 'cs_test_utvid');
select public.complete_project_launch((select id from launch_ids where name = 'upgrade'), 'cs_test_utvid', 500000, 'pi_test_2');
select is(
  (select launch_unit_limit from public.projects where id = (select project_id from launch_fixture)),
  19,
  'Etter utvidelsen dekker avgiften inntil 19 enheter'
);

-- En betaling som ble erstattet av en nyere, men som likevel ble betalt, registreres.
update public.project_launches set stripe_checkout_session_id = 'cs_test_forste'
where id = (select id from launch_ids where name = 'first');
select is(
  public.complete_project_launch((select id from launch_ids where name = 'first'), 'cs_test_forste', 690000, 'pi_test_3'),
  (select project_id from launch_fixture),
  'En utløpt betaling som likevel er betalt, registreres'
);
select is(
  (select launch_unit_limit from public.projects where id = (select project_id from launch_fixture)),
  19,
  'Nivået blir aldri mindre'
);

-- Frafall etter avtale: ingen grense, og et senere frafall med grense gir ingen grense fortsatt.
select public.waive_project_launch((select project_id from launch_fixture), null, 'Avtale om stort prosjekt');
select public.waive_project_launch((select project_id from launch_fixture), 99, 'Senere frafall');
select is(
  (select launch_unit_limit from public.projects where id = (select project_id from launch_fixture)),
  null,
  'Et prosjekt uten grense beholder det'
);
select is(
  tests.sqlstate_of($$ select public.waive_project_launch(gen_random_uuid()) $$),
  'P0002',
  'Frafall for et ukjent prosjekt avvises'
);
select tests.logout();

select ok(
  exists (
    select 1 from public.audit_log
    where project_id = (select project_id from launch_fixture) and action = 'project.launch_waived'
      and data ->> 'note' = 'Avtale om stort prosjekt'
  ),
  'Frafallet står i revisjonsloggen'
);

-- Hvem ser betalingene
select tests.login_as(tests.id('a', 'owner'));
select is(
  (select count(*)::integer from public.project_launches where project_id = (select project_id from launch_fixture)),
  5,
  'Eieren ser betalingene og frafallene'
);
select tests.logout();
select tests.login_as(tests.id('a', 'editor'));
select is(
  (select count(*)::integer from public.project_launches),
  0,
  'Redaktøren ser ikke betalingene'
);
select ok(
  (select launched_at is not null from public.projects where id = tests.id('a', 'project')),
  'Men ser om prosjektet er lansert'
);
select tests.logout();
select tests.login_as(tests.id('b', 'owner'));
select is(
  (select count(*)::integer from public.project_launches where organization_id = tests.id('a', 'org')),
  0,
  'En annen organisasjon ser ikke betalingene'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Prøveperioden: alt kan bygges, men ikke publiseres uten lansering
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('b', 'admin'));
select is(
  tests.sqlstate_of(format(
    $$ insert into public.projects (organization_id, name, slug, phase)
       select %L, 'Prøve ' || n, 'prove-' || n, 'for_sale' from generate_series(1, 5) as n $$,
    tests.id('b', 'org'))),
  '00000',
  'Prøveperioden: mange prosjekter kan være i salg'
);
select tests.logout();

select * from finish();
rollback;
