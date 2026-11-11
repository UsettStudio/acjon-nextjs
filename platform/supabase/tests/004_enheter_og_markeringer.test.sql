-- =============================================================================
-- Enheter, statuslogg, markeringer og dataintegritet
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');
select tests.seed_organization('b');

select plan(28);

-- -----------------------------------------------------------------------------
-- Akseptkriterium 2 (databasedelen): Solgt i Status-modus logges med bruker og tidspunkt
-- -----------------------------------------------------------------------------
select tests.login_as(tests.id('a', 'editor'));
select is(
  public.set_unit_status(array[tests.id('a', 'unit_available')], 'sold', 'Kontrakt signert', 'selector'),
  1,
  'set_unit_status returnerer antall enheter som ble endret'
);
select results_eq(
  format(
    $$ select from_status::text, to_status::text, changed_by, note, source
       from public.unit_status_events where unit_id = %L and to_status = 'sold' $$,
    tests.id('a', 'unit_available')
  ),
  format(
    $$ values ('available', 'sold', %L::uuid, 'Kontrakt signert', 'selector') $$,
    tests.id('a', 'editor')
  ),
  'Statusendringen står i loggen med fra/til, bruker, notat og kilde'
);
select ok(
  (select created_at > now() - interval '1 minute' from public.unit_status_events
   where unit_id = tests.id('a', 'unit_available') and to_status = 'sold'),
  'Statusendringen har tidspunkt'
);
select is(
  public.set_unit_status(array[tests.id('a', 'unit_available')], 'sold'),
  0,
  'Samme status på nytt gir ingen ny endring'
);
select is(
  (select count(*)::int from public.unit_status_events where unit_id = tests.id('a', 'unit_available')),
  3,
  'Ingen logglinje når statusen ikke endres'
);
update public.units set status = 'reserved' where id = tests.id('a', 'unit_sold');
select results_eq(
  format(
    $$ select to_status::text, source, note from public.unit_status_events
       where unit_id = %L and to_status = 'reserved' $$,
    tests.id('a', 'unit_sold')
  ),
  $$ values ('reserved', 'admin', null::text) $$,
  'Også direkte oppdateringer av status logges'
);
select is(
  public.set_unit_status(array[tests.id('a', 'unit_sold'), tests.id('a', 'unit_hidden')], 'upcoming', null, 'table'),
  2,
  'Flervalg: status settes på alle valgte enheter samtidig'
);
select tests.logout();

select ok(
  exists (
    select 1 from public.audit_log
    where organization_id = tests.id('a', 'org') and action = 'unit.status_changed'
      and actor_id = tests.id('a', 'editor') and data ->> 'to' = 'sold'
  ),
  'Statusendringen står også i revisjonsloggen'
);
select ok(
  exists (
    select 1 from public.webhook_deliveries
    where organization_id = tests.id('a', 'org') and event = 'unit.status_changed'
      and payload -> 'data' ->> 'unit_id' = tests.id('a', 'unit_available')::text
      and payload -> 'data' ->> 'to_status' = 'sold'
  ),
  'Webhook unit.status_changed er lagt i utboksen'
);
select ok(
  exists (
    select 1 from realtime.messages
    where topic = 'project:' || tests.id('a', 'project')::text || ':units'
      and event = 'unit_status'
      and payload ->> 'unit_id' = tests.id('a', 'unit_available')::text
      and payload ->> 'status' = 'sold'
      and not private
  ),
  'Statusendringen er kringkastet på prosjektets offentlige sanntidskanal'
);
select ok(
  not exists (
    select 1 from realtime.messages
    where payload ->> 'unit_id' = tests.id('a', 'unit_hidden')::text
  ),
  'Skjulte enheter kringkastes ikke'
);

-- -----------------------------------------------------------------------------
-- Statusloggen kan ikke endres
-- -----------------------------------------------------------------------------
select is(
  tests.sqlstate_of(format($$ update public.unit_status_events set note = 'endret' where unit_id = %L $$, tests.id('a', 'unit_available'))),
  '42501',
  'Statusloggen kan ikke endres, heller ikke av databaseeieren'
);
select is(
  tests.sqlstate_of(format($$ delete from public.unit_status_events where unit_id = %L $$, tests.id('a', 'unit_available'))),
  '42501',
  'Statusloggen kan ikke slettes'
);
select is(
  tests.sqlstate_of($$ delete from public.audit_log $$),
  '42501',
  'Revisjonsloggen kan ikke slettes'
);

-- -----------------------------------------------------------------------------
-- Sletting av enhet fjerner markeringene, men beholder historikken
-- -----------------------------------------------------------------------------
select tests.login_as(tests.id('a', 'editor'));
select is(
  (select count(*)::int from public.hotspots where target_unit_id = tests.id('a', 'unit_available')),
  1,
  'Antall markeringer som peker på enheten kan telles før bekreftelse'
);
delete from public.units where id = tests.id('a', 'unit_available');
select tests.logout();
select is(
  (select count(*)::int from public.hotspots where id = tests.id('a', 'hotspot_unit')),
  0,
  'Markeringen som pekte på enheten er fjernet'
);
select is(
  (select count(*)::int from public.unit_status_events where unit_number = 'A-101' and unit_id is null and organization_id = tests.id('a', 'org')),
  3,
  'Statushistorikken beholdes med enhetsnummer etter sletting'
);
select ok(
  exists (
    select 1 from public.audit_log
    where organization_id = tests.id('a', 'org') and action = 'unit.deleted'
      and actor_id = tests.id('a', 'editor') and data ->> 'unit_number' = 'A-101'
  ),
  'Slettingen står i revisjonsloggen med bruker'
);

-- -----------------------------------------------------------------------------
-- Dataintegritet på tvers av prosjekter og organisasjoner
-- -----------------------------------------------------------------------------
select is(
  tests.sqlstate_of(format(
    $$ insert into public.hotspots (organization_id, project_id, view_id, points, target_type, target_unit_id)
       values (%L, %L, %L, '[[0.1,0.1],[0.2,0.1],[0.2,0.2]]', 'unit', %L) $$,
    tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'view_building'), tests.id('b', 'unit_sold')
  )),
  '23503',
  'En markering kan ikke peke på en enhet i en annen organisasjon'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.units (organization_id, project_id, unit_number) values (%L, %L, 'X-1') $$,
    tests.id('a', 'org'), tests.id('b', 'project')
  )),
  '23503',
  'En enhet kan ikke ha organization_id fra én organisasjon og prosjekt fra en annen'
);
select is(
  tests.sqlstate_of(format(
    $$ update public.units set floor_plan_asset_ids = array[%L]::uuid[] where id = %L $$,
    tests.id('b', 'asset'), tests.id('a', 'unit_sold')
  )),
  '23503',
  'En enhet kan ikke bruke filer fra en annen organisasjons mediebibliotek'
);
select is(
  tests.sqlstate_of(format($$ update public.units set project_id = %L where id = %L $$, tests.id('a', 'project_other'), tests.id('a', 'unit_sold'))),
  '42501',
  'En enhet kan ikke flyttes til et annet prosjekt'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.units (organization_id, project_id, unit_number) values (%L, %L, 'A-302') $$,
    tests.id('a', 'org'), tests.id('a', 'project')
  )),
  '23505',
  'Enhetsnummer er unikt per prosjekt'
);
select is(
  (select slug from public.units where id = tests.id('a', 'unit_sold')),
  'a-302',
  'Slug lages automatisk fra enhetsnummeret'
);

-- -----------------------------------------------------------------------------
-- Markeringer: koordinater og visningstre
-- -----------------------------------------------------------------------------
select is(
  tests.sqlstate_of(format(
    $$ insert into public.hotspots (organization_id, project_id, view_id, points)
       values (%L, %L, %L, '[[0.1,0.1],[1.2,0.1],[0.2,0.2]]') $$,
    tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'view_building')
  )),
  '23514',
  'Koordinater utenfor 0–1 avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.hotspots (organization_id, project_id, view_id, shape, points)
       values (%L, %L, %L, 'rect', '[[0.5,0.5],[0.2,0.2]]') $$,
    tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'view_building')
  )),
  '23514',
  'Rektangel må ha øvre venstre hjørne før nedre høyre'
);
select is(
  tests.sqlstate_of(format(
    $$ update public.selector_views set parent_view_id = %L where id = %L $$,
    tests.id('a', 'view_building'), tests.id('a', 'view_overview')
  )),
  '23514',
  'En visning kan ikke legges under sin egen undervisning'
);
select lives_ok(
  format(
    $$ insert into public.hotspots (organization_id, project_id, view_id, points)
       values (%L, %L, %L, '[[0,0],[1,0],[1,1],[0,1]]') $$,
    tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'view_building')
  ),
  'En form kan tegnes før den kobles til noe'
);

select * from finish();
rollback;
