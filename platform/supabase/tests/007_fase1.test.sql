-- =============================================================================
-- Fase 1: prosjektopprettelse, import av enheter, prisjustering og filstier
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');
select tests.seed_organization('b');

-- SQLSTATE og detaljfeltet fra en feil, for å sjekke at importen oppgir radnummeret.
create function tests.error_detail_of(p_sql text)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_detail text;
begin
  execute p_sql;
  return null;
exception when others then
  get stacked diagnostics v_detail = pg_exception_detail;
  return sqlstate || ' ' || coalesce(v_detail, '');
end;
$$;
grant execute on function tests.error_detail_of(text) to authenticated;

select plan(44);

-- -----------------------------------------------------------------------------
-- create_project
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'admin'));
select is(
  public.create_project(
    tests.id('a', 'org'),
    '{"name": " Fjordparken ", "phase": "for_sale", "address": "Fjordveien 1", "postal_code": "0150",
      "city": "Oslo", "municipality": "Oslo", "lat": 59.9, "lng": 10.7,
      "milestones": [{"key": "move_in", "text": "Høsten 2027"}],
      "contacts": [{"name": "Kari Megler", "email": "kari@example.test"}]}',
    '[{"name": "Trinn 1", "buildings": ["Hus A", "Hus B"]}, {"name": "Trinn 2", "buildings": []}]',
    '["Garasje"]'
  ) ->> 'slug',
  'fjordparken',
  'Administrator oppretter prosjekt. Adressen lages fra navnet'
);
select is(
  public.create_project(tests.id('a', 'org'), '{"name": "Fjordparken"}') ->> 'slug',
  'fjordparken-2',
  'Et prosjekt med samme navn får tall på slutten av adressen'
);
select results_eq(
  $$ select s.name, s.sort_order, s.phase::text from public.stages s
     join public.projects p on p.id = s.project_id where p.slug = 'fjordparken' order by s.sort_order $$,
  $$ values ('Trinn 1', 1, 'for_sale'), ('Trinn 2', 2, 'for_sale') $$,
  'Byggetrinnene opprettes i rekkefølge og får prosjektets fase'
);
select results_eq(
  $$ select b.name, s.name from public.buildings b
     join public.projects p on p.id = b.project_id
     left join public.stages s on s.id = b.stage_id
     where p.slug = 'fjordparken' order by b.sort_order $$,
  $$ values ('Hus A', 'Trinn 1'), ('Hus B', 'Trinn 1'), ('Garasje', null) $$,
  'Bygg kobles til sitt byggetrinn. Bygg uten byggetrinn opprettes også'
);
select results_eq(
  $$ select name, city, milestones -> 0 ->> 'text', contacts -> 0 ->> 'name'
     from public.projects where slug = 'fjordparken' $$,
  $$ values ('Fjordparken', 'Oslo', 'Høsten 2027', 'Kari Megler') $$,
  'Navn trimmes, og adresse, fremdrift og kontaktpersoner lagres'
);
select ok(
  exists (select 1 from public.audit_log where action = 'project.created' and organization_id = tests.id('a', 'org')),
  'Opprettelsen står i revisjonsloggen'
);
select tests.logout();

select tests.login_as(tests.id('a', 'editor'));
select is(
  tests.sqlstate_of(format($$ select public.create_project(%L, '{"name": "Nytt"}') $$, tests.id('a', 'org'))),
  '42501',
  'Redaktør kan ikke opprette prosjekter'
);
select tests.logout();

select tests.login_as(tests.id('b', 'owner'));
select is(
  tests.sqlstate_of(format($$ select public.create_project(%L, '{"name": "Inntrenger"}') $$, tests.id('a', 'org'))),
  '42501',
  'Eier i en annen organisasjon kan ikke opprette prosjekter her'
);
select tests.logout();

update public.organizations set subscription_status = 'canceled' where id = tests.id('a', 'org');
select tests.login_as(tests.id('a', 'owner'));
select is(
  tests.sqlstate_of(format($$ select public.create_project(%L, '{"name": "Lesemodus"}') $$, tests.id('a', 'org'))),
  '42501',
  'Ingen kan opprette prosjekter i lesemodus'
);
select tests.logout();
update public.organizations set subscription_status = 'active' where id = tests.id('a', 'org');

-- -----------------------------------------------------------------------------
-- import_units
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'editor'));
select is(
  public.import_units(
    tests.id('a', 'project'),
    '[{"unit_number": "A-101", "price": 4500000, "status": "reserved", "stage": "byggetrinn 1", "building": "bygg a"},
      {"unit_number": "B-101", "price": 3500000, "status": null, "stage": "Byggetrinn 2", "building": "Bygg C", "title": "Ny"},
      {"unit_number": "B-102", "price": null, "status": "sold", "stage": "Byggetrinn 2", "building": "Bygg C",
       "bra_i": 54.25, "floor": "2"}]',
    array['unit_number', 'price', 'status', 'stage', 'building', 'title', 'bra_i', 'floor']
  ),
  '{"inserted": 2, "updated": 1, "unchanged": 0, "status_changed": 1, "stages_created": 1, "buildings_created": 1}'::jsonb,
  'Redaktør importerer: to nye enheter og én oppdatert på enhetsnummer'
);
select results_eq(
  format(
    $$ select price, status::text, rooms, stage_id = %L, building_id = %L
       from public.units where id = %L $$,
    tests.id('a', 'stage'), tests.id('a', 'building'), tests.id('a', 'unit_available')
  ),
  $$ values (4500000::bigint, 'reserved', 3::smallint, true, true) $$,
  'Eksisterende enhet får ny pris og status. Kolonner som ikke er koblet, beholdes. Navn matches uten store/små bokstaver'
);
select results_eq(
  format(
    $$ select from_status::text, to_status::text, source from public.unit_status_events
       where unit_id = %L and to_status = 'reserved' and source = 'import' $$,
    tests.id('a', 'unit_available')
  ),
  $$ values ('available', 'reserved', 'import') $$,
  'Statusendringen logges med kilde «import»'
);
select results_eq(
  format(
    $$ select u.unit_number, u.status::text, u.title, u.price, u.bra_i, u.floor, s.name, b.name, b.stage_id = s.id,
              u.source, u.slug
       from public.units u
       join public.stages s on s.id = u.stage_id
       join public.buildings b on b.id = u.building_id
       where u.project_id = %L and u.unit_number like 'B-%%' order by u.unit_number $$,
    tests.id('a', 'project')
  ),
  $$ values
       ('B-101', 'available', 'Ny', 3500000::bigint, null::numeric, null::smallint, 'Byggetrinn 2', 'Bygg C', true, 'import', 'b-101'),
       ('B-102', 'sold', null, null::bigint, 54.3::numeric, 2::smallint, 'Byggetrinn 2', 'Bygg C', true, 'import', 'b-102') $$,
  'Nye enheter får standardstatus når status er tom, og nye byggetrinn og bygg opprettes'
);
select ok(
  (select min(sort_order) from public.units where project_id = tests.id('a', 'project') and unit_number like 'B-%')
    > (select max(sort_order) from public.units where project_id = tests.id('a', 'project') and unit_number like 'A-%'),
  'Nye enheter legges sist, i samme rekkefølge som i importen'
);
select is(
  public.import_units(
    tests.id('a', 'project'),
    '[{"unit_number": "A-101", "price": 4500000, "status": "reserved", "stage": "Byggetrinn 1", "building": "Bygg A"},
      {"unit_number": "B-101", "price": 3500000, "status": null, "stage": "Byggetrinn 2", "building": "Bygg C", "title": "Ny"},
      {"unit_number": "B-102", "price": null, "status": "sold", "stage": "Byggetrinn 2", "building": "Bygg C",
       "bra_i": 54.3, "floor": 2}]',
    array['unit_number', 'price', 'status', 'stage', 'building', 'title', 'bra_i', 'floor']
  ) ->> 'unchanged',
  '3',
  'Samme import på nytt endrer ingenting'
);
select is(
  public.import_units(tests.id('a', 'project'), '[{"unit_number": "B-101", "title": null}]', array['unit_number', 'title'])
    ->> 'updated',
  '1',
  'En tom celle i en koblet kolonne tømmer feltet'
);
select is(
  (select title from public.units where project_id = tests.id('a', 'project') and unit_number = 'B-101'),
  null,
  'Tittelen er tømt'
);
select is(
  tests.error_detail_of(format(
    $$ select public.import_units(%L, '[{"unit_number": "C-1", "unit_type": "apartment"}, {"unit_number": "C-2", "unit_type": "slott"}]',
       array['unit_number', 'unit_type']) $$,
    tests.id('a', 'project')
  )),
  '22P02 import_row=2',
  'En ugyldig verdi stopper importen, og feilen oppgir radnummeret'
);
select is(
  (select count(*)::integer from public.units where project_id = tests.id('a', 'project') and unit_number like 'C-%'),
  0,
  'Ingen rader lagres når én rad feiler'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.import_units(%L, '[{"unit_number": "D-1"}, {"unit_number": " D-1 "}]', array['unit_number']) $$,
    tests.id('a', 'project')
  )),
  '23505',
  'Samme enhetsnummer to ganger i importen avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.import_units(%L, '[{"unit_number": "D-1", "organization_id": "x"}]', array['unit_number', 'organization_id']) $$,
    tests.id('a', 'project')
  )),
  '22023',
  'Bare kjente kolonner kan importeres'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.import_units(%L, '[{"unit_number": "D-1"}]', array['unit_number']) $$,
    tests.id('a', 'project_other')
  )),
  '42501',
  'Redaktør kan ikke importere i et prosjekt hen ikke er tildelt'
);
select tests.logout();
select ok(
  exists (
    select 1 from public.audit_log
    where action = 'units.imported' and project_id = tests.id('a', 'project') and (data ->> 'inserted')::integer = 2
  ),
  'Importen står i revisjonsloggen med antall'
);

select tests.login_as(tests.id('a', 'agent'));
select is(
  tests.sqlstate_of(format(
    $$ select public.import_units(%L, '[{"unit_number": "A-101", "price": 1}]', array['unit_number', 'price']) $$,
    tests.id('a', 'project')
  )),
  '42501',
  'Megler kan ikke importere'
);
select tests.logout();

select tests.login_as(tests.id('b', 'owner'));
select is(
  tests.sqlstate_of(format(
    $$ select public.import_units(%L, '[{"unit_number": "A-101", "price": 1}]', array['unit_number', 'price']) $$,
    tests.id('a', 'project')
  )),
  '42501',
  'Eier i en annen organisasjon kan ikke importere her'
);
select tests.logout();

update public.organizations set subscription_status = 'canceled' where id = tests.id('a', 'org');
select tests.login_as(tests.id('a', 'owner'));
select is(
  tests.sqlstate_of(format(
    $$ select public.import_units(%L, '[{"unit_number": "E-1"}]', array['unit_number']) $$,
    tests.id('a', 'project')
  )),
  '42501',
  'Ingen kan importere i lesemodus'
);
select tests.logout();
update public.organizations set subscription_status = 'active' where id = tests.id('a', 'org');

-- -----------------------------------------------------------------------------
-- adjust_unit_prices
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'agent'));
select is(
  public.adjust_unit_prices(
    array[tests.id('a', 'unit_available'), tests.id('a', 'unit_hidden'),
          (select id from public.units where project_id = tests.id('a', 'project') and unit_number = 'B-102')],
    3,
    1000
  ),
  2,
  'Megler justerer pris i prosent. Enheter uten pris telles ikke'
);
select results_eq(
  format($$ select price from public.units where id in (%L, %L) order by unit_number $$,
         tests.id('a', 'unit_available'), tests.id('a', 'unit_hidden')),
  $$ values (4635000::bigint), (4017000::bigint) $$,
  'Ny pris er avrundet til nærmeste tusen'
);
select is(
  tests.sqlstate_of(format($$ select public.adjust_unit_prices(array[%L]::uuid[], 0) $$, tests.id('a', 'unit_available'))),
  '22023',
  'Null prosent avvises'
);
select is(
  tests.sqlstate_of(format($$ select public.adjust_unit_prices(array[%L]::uuid[], 5, 7) $$, tests.id('a', 'unit_available'))),
  '22023',
  'Bare faste avrundinger er lov'
);
select is(
  tests.sqlstate_of(format($$ select public.adjust_unit_prices(array[%L]::uuid[], 5) $$, tests.id('b', 'unit_available'))),
  '42501',
  'Megler kan ikke endre pris i en annen organisasjon'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- unit_status_counts
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'agent'));
select results_eq(
  format(
    $$ select status::text, units from public.unit_status_counts(array[%L, %L]::uuid[]) order by status $$,
    tests.id('a', 'project'), tests.id('b', 'project')
  ),
  $$ values ('available', 2::bigint), ('reserved', 1::bigint), ('sold', 2::bigint) $$,
  'Telling per status gjelder bare enheter brukeren har tilgang til'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Enhetens adresse følger enhetsnummeret
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'editor'));
update public.units set unit_number = 'A-302B' where id = tests.id('a', 'unit_sold');
select is(
  (select slug from public.units where id = tests.id('a', 'unit_sold')),
  'a-302b',
  'Automatisk adresse følger nytt enhetsnummer'
);
update public.units set slug = 'toppleiligheten' where id = tests.id('a', 'unit_sold');
update public.units set unit_number = 'A-302' where id = tests.id('a', 'unit_sold');
select is(
  (select slug from public.units where id = tests.id('a', 'unit_sold')),
  'toppleiligheten',
  'En adresse satt for hånd beholdes når enhetsnummeret endres'
);
select is(
  tests.sqlstate_of(format(
    $$ update public.units set unit_number = 'B 101' where id = %L $$, tests.id('a', 'unit_hidden')
  )),
  '23505',
  'Et nummer som gir samme adresse som en annen enhet, avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ update public.units set unit_number = 'b-101 ' where id = %L $$, tests.id('a', 'unit_hidden')
  )),
  '23514',
  'Enhetsnummer kan ikke ha mellomrom foran eller bak'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Statusloggen har navn på den som endret
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'agent'));
select results_eq(
  format(
    $$ select p.full_name from public.unit_status_events e join public.profiles p on p.id = e.changed_by
       where e.unit_id = %L and e.source = 'import' $$,
    tests.id('a', 'unit_available')
  ),
  $$ values ('Redaktør A') $$,
  'Statusloggen kan kobles til profilen til den som endret'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Filstier i mediebiblioteket
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'editor'));
select is(
  tests.sqlstate_of(format(
    $$ insert into public.assets (organization_id, storage_path, mime, bytes)
       values (%L, %L || '/annen-mappe/original.jpg', 'image/jpeg', 100) $$,
    tests.id('a', 'org'), tests.id('a', 'org')
  )),
  '23514',
  'Originalen må ligge i filens egen mappe'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.assets (id, organization_id, storage_path, mime, bytes, variants)
       values ('00000000-0000-4000-8000-000000000001', %L,
               %L || '/00000000-0000-4000-8000-000000000001/original.jpg', 'image/jpeg', 100,
               jsonb_build_array(jsonb_build_object('path', %L || '/en-annen-fil/w800.webp', 'width', 800, 'height', 600))) $$,
    tests.id('a', 'org'), tests.id('a', 'org'), tests.id('a', 'org')
  )),
  '23514',
  'Varianter må ligge i samme mappe som originalen'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.assets (id, organization_id, storage_path, mime, bytes, variants)
       values ('00000000-0000-4000-8000-000000000002', %L,
               %L || '/00000000-0000-4000-8000-000000000002/../original.jpg', 'image/jpeg', 100, '[]') $$,
    tests.id('a', 'org'), tests.id('a', 'org')
  )),
  '23514',
  'Stier med .. avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.assets (id, organization_id, storage_path, mime, bytes, width, height, variants)
       values ('00000000-0000-4000-8000-000000000003', %L,
               %L || '/00000000-0000-4000-8000-000000000003/original.jpg', 'image/jpeg', 100, 1200, 800,
               jsonb_build_array(jsonb_build_object(
                 'path', %L || '/00000000-0000-4000-8000-000000000003/w800.webp', 'width', 800, 'height', 533, 'bytes', 4000))) $$,
    tests.id('a', 'org'), tests.id('a', 'org'), tests.id('a', 'org')
  )),
  '00000',
  'Fil med varianter i riktig mappe lagres'
);
select is(
  tests.sqlstate_of(format(
    $$ update public.assets set variants = jsonb_build_array(jsonb_build_object('path', 'x/w800.webp', 'width', 800, 'height', 533))
       where id = %L $$,
    '00000000-0000-4000-8000-000000000003'
  )),
  '23514',
  'Varianter kan heller ikke endres til en annen mappe'
);
select tests.logout();

select tests.login_as(tests.id('b', 'owner'));
select is(
  tests.sqlstate_of(format(
    $$ insert into public.assets (id, organization_id, storage_path, mime, bytes)
       values ('00000000-0000-4000-8000-000000000004', %L,
               %L || '/00000000-0000-4000-8000-000000000004/original.jpg', 'image/jpeg', 100) $$,
    tests.id('a', 'org'), tests.id('a', 'org')
  )),
  '42501',
  'En annen organisasjon kan ikke legge filer i dette biblioteket'
);
select is(
  (select count(*)::integer from public.assets where organization_id = tests.id('a', 'org')),
  0,
  'Og ser ingen av filene her'
);
select tests.logout();

select * from finish();
rollback;
