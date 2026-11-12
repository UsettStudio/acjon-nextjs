-- =============================================================================
-- Fase 5: prosjektoversikten (antall, verdi solgt og fremdrift i oppstarten)
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');
select tests.seed_organization('b');

select plan(15);

-- Prosjektet i organisasjon A har A-101 (ledig, 4 250 000), A-303 (ledig og
-- skjult, 3 900 000) og A-302 (solgt, 6 950 000). To visninger har bilde, A-101
-- og A-302 er markert, og boligvelgeren og prosjektsiden er publisert.
select tests.login_as(tests.id('a', 'admin'));
select is(
  public.project_overview(tests.id('a', 'project')),
  jsonb_build_object(
    'statuses', jsonb_build_array(
      jsonb_build_object('status', 'available', 'units', 2, 'value', 8150000, 'unpriced', 0),
      jsonb_build_object('status', 'sold', 'units', 1, 'value', 6950000, 'unpriced', 0)
    ),
    'views_with_image', 2,
    'marked_units', 2,
    'selector', jsonb_build_object('id', tests.id('a', 'selector'), 'published', true),
    'site', jsonb_build_object('id', tests.id('a', 'site'), 'published', true)
  ),
  'Administrator: antall og verdi per status, bilder, markerte enheter og publisering'
);

-- En solgt enhet uten pris telles, men er ikke med i verdien.
insert into public.units (organization_id, project_id, unit_number, status)
values (tests.id('a', 'org'), tests.id('a', 'project'), 'A-999', 'sold');
select is(
  public.project_overview(tests.id('a', 'project'))->'statuses'->1,
  jsonb_build_object('status', 'sold', 'units', 2, 'value', 6950000, 'unpriced', 1),
  'Solgte enheter uten pris telles i «unpriced» og ikke i verdien'
);

-- To markeringer av samme enhet teller som én markert enhet.
insert into public.hotspots (organization_id, project_id, view_id, shape, points, target_type, target_unit_id)
values (tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'view_overview'), 'rect',
        '[[0.6, 0.6], [0.8, 0.8]]', 'unit', tests.id('a', 'unit_sold'));
select is(
  (public.project_overview(tests.id('a', 'project'))->>'marked_units')::integer,
  2,
  'Markerte enheter telles én gang selv om de er markert i flere visninger'
);

select public.unpublish_site(tests.id('a', 'site'));
select is(
  public.project_overview(tests.id('a', 'project'))->'site',
  jsonb_build_object('id', tests.id('a', 'site'), 'published', false),
  'Prosjektsiden vises som upublisert'
);
select tests.logout();

-- Megleren er medlem av prosjektet og ser de samme tallene.
select tests.login_as(tests.id('a', 'agent'));
select is(
  (public.project_overview(tests.id('a', 'project'))->'statuses'->1->>'value')::bigint,
  6950000::bigint,
  'Megler i prosjektet ser verdi solgt'
);
select tests.logout();

-- Redaktøren er ikke medlem av det andre prosjektet og får ingenting derfra.
select tests.login_as(tests.id('a', 'editor'));
select is(
  public.project_overview(tests.id('a', 'project_other')),
  jsonb_build_object('statuses', '[]'::jsonb, 'views_with_image', 0, 'marked_units', 0, 'selector', null, 'site', null),
  'Redaktør uten tilgang til prosjektet får verken tall eller fremdrift'
);
select tests.logout();

-- En annen organisasjon får ingenting, selv med riktig prosjekt-id.
select tests.login_as(tests.id('b', 'owner'));
select is(
  public.project_overview(tests.id('a', 'project')),
  jsonb_build_object('statuses', '[]'::jsonb, 'views_with_image', 0, 'marked_units', 0, 'selector', null, 'site', null),
  'Eier i organisasjon B får ingenting fra prosjektet i organisasjon A'
);
select isnt(
  public.project_overview(tests.id('b', 'project'))->'statuses',
  '[]'::jsonb,
  'Eier i organisasjon B ser sitt eget prosjekt'
);
select tests.logout();

-- Anonyme kan ikke kalle funksjonen.
select tests.login_as_anon();
select is(
  tests.sqlstate_of(format($$ select public.project_overview(%L) $$, tests.id('a', 'project'))),
  '42501',
  'Anonyme får ikke kjøre prosjektoversikten'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Sletting av prosjekt og organisasjon (kaskader i revisjonsloggen)
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'owner'));
select is(
  tests.sqlstate_of(format($$ delete from public.units where id = %L $$, tests.id('a', 'unit_hidden'))),
  '00000',
  'En enhet kan slettes'
);
select ok(
  exists (select 1 from public.audit_log l where l.action = 'unit.deleted' and l.entity_id = tests.id('a', 'unit_hidden')),
  'Sletting av én enhet logges'
);
select is(
  tests.sqlstate_of(format($$ delete from public.projects where id = %L $$, tests.id('a', 'project'))),
  '00000',
  'Et prosjekt med enheter, markeringer og leads kan slettes'
);
select tests.logout();
select is(
  (select count(*)::integer from public.audit_log l
   where l.action = 'project.deleted' and l.entity_id = tests.id('a', 'project')),
  1,
  'Slettingen logges som ett prosjekt, ikke rad for rad'
);
select is(
  (select count(*)::integer from public.audit_log l where l.action = 'unit.deleted' and l.organization_id = tests.id('a', 'org')),
  1,
  'Enhetene som ble slettet med prosjektet, logges ikke hver for seg'
);

-- Organisasjoner slettes bare av plattformen (service-rollen), med alt innhold og all logg.
delete from public.organizations where id = tests.id('b', 'org');
select is(
  (select count(*)::integer from public.audit_log where organization_id = tests.id('b', 'org'))
    + (select count(*)::integer from public.units where organization_id = tests.id('b', 'org'))
    + (select count(*)::integer from public.unit_status_events where organization_id = tests.id('b', 'org'))
    + (select count(*)::integer from public.leads where organization_id = tests.id('b', 'org')),
  0,
  'Sletting av en organisasjon fjerner enheter, statuslogg, leads og revisjonslogg'
);

select * from finish();
rollback;
