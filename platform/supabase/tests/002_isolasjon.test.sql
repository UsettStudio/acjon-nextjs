-- =============================================================================
-- Akseptkriterium 6: En bruker i én organisasjon får ingen rader og ingen
-- skrivetilgang ved forsøk mot en annen organisasjons data – for hver tabell.
-- =============================================================================
-- Testen finner selv alle tabeller med organization_id, så nye tabeller blir
-- automatisk med. Den feiler hvis fixturen ikke har data for en tabell, slik at
-- testen aldri kan bli grønn uten å ha prøvd.
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');
select tests.seed_organization('b');

create temp table iso_tables on commit drop as
select c.table_name::text as table_name
from information_schema.columns c
join information_schema.tables t
  on t.table_schema = c.table_schema and t.table_name = c.table_name and t.table_type = 'BASE TABLE'
where c.table_schema = 'public' and c.column_name = 'organization_id';

create temp table iso_roles on commit drop as
select role_name from (values ('owner'), ('admin'), ('editor'), ('agent')) as r(role_name);

-- Organisasjon B sine data før forsøkene, og en eksempelrad per tabell å kopiere.
create temp table b_before on commit drop as
select table_name,
       tests.table_checksum(table_name, tests.id('b', 'org')) as checksum,
       tests.sample_row(table_name, tests.id('b', 'org')) as sample
from iso_tables;

-- Resultater samles her, siden testen bytter mellom roller.
create temp table iso_results (
  table_name text,
  role_name text,
  operation text,
  outcome text
) on commit drop;
grant select on iso_tables, iso_roles, b_before to authenticated;
grant insert on iso_results to authenticated;

select plan(
  1                                           -- fixturen dekker alle tabeller
  + (select count(*)::int from iso_tables) * 4  -- lese, sette inn, endre, slette
  + 1                                         -- B sine data er uendret
  + 11                                        -- profiler, lagring og funksjoner
);

select is_empty(
  $$ select table_name from b_before where sample is null $$,
  'Fixturen har data i alle tabeller med organization_id'
);

-- Alle fire roller i organisasjon A prøver alt mot organisasjon B.
do $$
declare
  v_role text;
  v_table record;
begin
  for v_role in select role_name from iso_roles loop
    perform tests.login_as(tests.id('a', v_role));
    for v_table in select table_name, sample from b_before loop
      insert into iso_results values
        (v_table.table_name, v_role, 'select', tests.visible_rows(v_table.table_name, tests.id('b', 'org'))),
        (v_table.table_name, v_role, 'insert', tests.try_insert(v_table.table_name, v_table.sample)),
        (v_table.table_name, v_role, 'update', tests.try_update(v_table.table_name, tests.id('b', 'org'))),
        (v_table.table_name, v_role, 'delete', tests.try_delete(v_table.table_name, tests.id('b', 'org')));
    end loop;
    perform tests.logout();
  end loop;
end;
$$;

-- Lesing: 0 rader (eller ingen leserettighet i det hele tatt).
select is_empty(
  format(
    $$ select role_name || ': ' || outcome from iso_results
       where table_name = %L and operation = 'select' and outcome not in ('0', 'no-privilege') $$,
    table_name
  ),
  format('%s: ingen rolle i A kan lese rader fra B', table_name)
)
from iso_tables order by table_name;

-- Innsetting: avvist av RLS (42501) eller av manglende rettighet. Kom raden
-- gjennom RLS, ville resultatet vært 'inserted' eller et brudd på en regel som
-- sjekkes etter RLS (unikhet, fremmednøkkel eller CHECK).
select is_empty(
  format(
    $$ select role_name || ': ' || outcome from iso_results
       where table_name = %L and operation = 'insert' and outcome not in ('42501', 'no-privilege') $$,
    table_name
  ),
  format('%s: ingen rolle i A kan legge inn rader i B', table_name)
)
from iso_tables order by table_name;

select is_empty(
  format(
    $$ select role_name || ': ' || outcome from iso_results
       where table_name = %L and operation = 'update' and outcome not in ('0', '42501', 'no-privilege') $$,
    table_name
  ),
  format('%s: ingen rolle i A kan endre rader i B', table_name)
)
from iso_tables order by table_name;

select is_empty(
  format(
    $$ select role_name || ': ' || outcome from iso_results
       where table_name = %L and operation = 'delete' and outcome not in ('0', '42501', 'no-privilege') $$,
    table_name
  ),
  format('%s: ingen rolle i A kan slette rader i B', table_name)
)
from iso_tables order by table_name;

select is_empty(
  $$ select table_name from b_before
     where checksum is distinct from tests.table_checksum(table_name, tests.id('b', 'org')) $$,
  'Alle data i organisasjon B er uendret etter forsøkene'
);

-- Profiler: bare egne og kollegers.
select tests.login_as(tests.id('a', 'owner'));
select is(
  (select count(*)::int from public.profiles where id in (tests.id('b', 'owner'), tests.id('b', 'agent'))),
  0,
  'Brukere i A ser ikke profilene til brukere i B'
);
select is(
  (select count(*)::int from public.profiles where id in (tests.id('a', 'agent'), tests.id('a', 'editor'))),
  2,
  'Brukere i A ser profilene til kolleger i A'
);
select is((select count(*)::int from public.platform_admins), 0, 'Vanlige brukere ser ingen plattformadmins');

-- Fillagring: bare egen organisasjons mappe.
select is(
  tests.sqlstate_of(format(
    $$ insert into storage.objects (bucket_id, name) values ('media', %L) $$,
    tests.id('b', 'org')::text || '/' || gen_random_uuid()::text || '/original.jpg'
  )),
  '42501',
  'Eier i A kan ikke laste opp filer i mappen til B'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into storage.objects (bucket_id, name) values ('media', %L) $$,
    tests.id('a', 'org')::text || '/' || gen_random_uuid()::text || '/original.jpg'
  )),
  '00000',
  'Eier i A kan laste opp filer i sin egen mappe'
);
select tests.logout();
insert into storage.objects (bucket_id, name)
values ('media', tests.id('b', 'org')::text || '/fil-fra-b/original.jpg');
select tests.login_as(tests.id('a', 'owner'));
select is(
  (select count(*)::int from storage.objects where name like tests.id('b', 'org')::text || '/%'),
  0,
  'Eier i A ser ikke filene til B i Storage'
);

-- Funksjonene sjekker også organisasjon.
select is(
  tests.sqlstate_of(format($$ select public.set_unit_status(array[%L]::uuid[], 'sold') $$, tests.id('b', 'unit_available'))),
  '42501',
  'Eier i A kan ikke endre status på en enhet i B'
);
select is(
  tests.sqlstate_of(format($$ select public.publish_selector(%L) $$, tests.id('b', 'selector'))),
  '42501',
  'Eier i A kan ikke publisere boligvelgeren til B'
);
select is(
  tests.sqlstate_of(format($$ select public.publish_site(%L) $$, tests.id('b', 'site'))),
  '42501',
  'Eier i A kan ikke publisere prosjektsiden til B'
);
select is(
  tests.sqlstate_of(format($$ select public.get_selector_preview(%L) $$, tests.id('b', 'selector'))),
  '42501',
  'Eier i A kan ikke forhåndsvise boligvelgeren til B'
);
select is(
  tests.sqlstate_of($$ select public.accept_invitation('invitasjon-b') $$),
  '42501',
  'Eier i A kan ikke bruke en invitasjon til B som gjelder en annen e-postadresse'
);
select tests.logout();

select * from finish();
rollback;
