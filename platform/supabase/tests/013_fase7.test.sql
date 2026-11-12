-- =============================================================================
-- Fase 7: plattformadmin lanserer prosjekter etter avtale
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');

select plan(9);

-- Prosjektet «Annet prosjekt» i testdataene er ikke lansert.
select is(
  (select launched_at from public.projects where id = tests.id('a', 'project_other')),
  null,
  'Prosjektet er ikke lansert'
);

select tests.login_as(tests.id('a', 'owner'));
select is(
  tests.sqlstate_of(format($$ select public.platform_launch_project(%L, null, 'Avtale') $$, tests.id('a', 'project_other'))),
  '42501',
  'Eieren kan ikke lansere uten oppstartsavgift'
);
select tests.logout();

select tests.create_user('support-fase7@example.test', 'Support') as support_id \gset
insert into public.platform_admins (user_id) values (:'support_id');
select tests.login_as(:'support_id');
select is(
  tests.sqlstate_of(format($$ select public.platform_launch_project(%L, null, '  ') $$, tests.id('a', 'project_other'))),
  '22023',
  'Avtalen må beskrives i notatet'
);
select is(
  tests.sqlstate_of(format($$ select public.platform_launch_project(%L, 0, 'Avtale') $$, tests.id('a', 'project_other'))),
  '22023',
  'Grensen må være minst én enhet'
);
select is(
  tests.sqlstate_of($$ select public.platform_launch_project(gen_random_uuid(), null, 'Avtale') $$),
  'P0002',
  'Ukjent prosjekt avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.platform_launch_project(%L, 250, 'Avtale 2026-11: 250 enheter') $$, tests.id('a', 'project_other'))),
  '00000',
  'Plattformadmin lanserer prosjektet etter avtale'
);
select results_eq(
  format($$ select launched_at is not null, launch_unit_limit from public.projects where id = %L $$, tests.id('a', 'project_other')),
  $$ values (true, 250) $$,
  'Prosjektet er lansert med grensen fra avtalen'
);
select is(
  (select count(*)::integer from public.project_launches
   where project_id = tests.id('a', 'project_other') and kind = 'waiver' and note = 'Avtale 2026-11: 250 enheter'),
  1,
  'Plattformadmin ser frafallet med notatet'
);
select tests.logout();

select ok(
  exists (
    select 1 from public.audit_log
    where project_id = tests.id('a', 'project_other') and action = 'project.launch_waived'
      and actor_type = 'platform_admin' and (data ->> 'unit_limit')::integer = 250
  ),
  'Lanseringen logges med plattformadmin som aktør'
);

select * from finish();
rollback;
