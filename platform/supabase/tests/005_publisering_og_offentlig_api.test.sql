-- =============================================================================
-- Publisering og offentlig lese-API: bare publiserte data, aldri interne felt
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');

select plan(30);

-- -----------------------------------------------------------------------------
-- anon har bare tilgang via de offentlige funksjonene
-- -----------------------------------------------------------------------------
select tests.login_as_anon();
select is(tests.sqlstate_of('select 1 from public.units limit 1'), '42501', 'anon kan ikke lese tabeller direkte');
select is(tests.sqlstate_of('select 1 from public.leads limit 1'), '42501', 'anon kan ikke lese leads');
select is(tests.sqlstate_of($$ select public.create_organization('X', 'x') $$), '42501', 'anon kan ikke opprette organisasjoner');
select is(
  tests.sqlstate_of(format($$ select public.set_unit_status(array[%L]::uuid[], 'sold') $$, tests.id('a', 'unit_sold'))),
  '42501',
  'anon kan ikke endre status'
);

-- -----------------------------------------------------------------------------
-- Publisert boligvelger
-- -----------------------------------------------------------------------------
select isnt(public.get_published_selector(tests.id('a', 'selector')), null, 'Publisert boligvelger kan hentes av anon');
select is(
  jsonb_array_length(public.get_published_selector(tests.id('a', 'selector')) -> 'units'),
  2,
  'Skjulte enheter er ikke med i den publiserte velgeren'
);
select is(
  (select u -> 'price' from jsonb_array_elements(public.get_published_selector(tests.id('a', 'selector')) -> 'units') u
   where u ->> 'unit_number' = 'A-302'),
  'null'::jsonb,
  'Prisen skjules på solgte enheter når prosjektet er satt opp slik'
);
select is(
  (select (u ->> 'price_hidden')::boolean from jsonb_array_elements(public.get_published_selector(tests.id('a', 'selector')) -> 'units') u
   where u ->> 'unit_number' = 'A-302'),
  true,
  'Svaret sier at prisen er skjult, så velgeren kan vise «Solgt»'
);
select is(
  (select (u ->> 'price')::bigint from jsonb_array_elements(public.get_published_selector(tests.id('a', 'selector')) -> 'units') u
   where u ->> 'unit_number' = 'A-101'),
  4250000::bigint,
  'Prisen vises på ledige enheter'
);
select ok(
  public.get_published_selector(tests.id('a', 'selector'))::text not like '%INTERN-HEMMELIGHET%'
  and public.get_published_selector(tests.id('a', 'selector'))::text not like '%EKSTERN-ID-HEMMELIG%'
  and public.get_published_selector(tests.id('a', 'selector'))::text not like '%"source"%'
  and public.get_published_selector(tests.id('a', 'selector'))::text not like '%is_hidden%',
  'Interne felt (egne felt som ikke er offentlige, external_id, source, is_hidden) er ikke med'
);
select is(
  (select u -> 'custom_fields' from jsonb_array_elements(public.get_published_selector(tests.id('a', 'selector')) -> 'units') u
   where u ->> 'unit_number' = 'A-101'),
  '{"solforhold": "Kveldssol"}'::jsonb,
  'Bare egne felt som prosjektet har gjort offentlige er med'
);
select is_empty(
  format(
    $$ select h from jsonb_path_query(public.get_published_selector(%L), '$.selector.views[*].hotspots[*]') h
       where h ? 'status' or h ? 'color' or h ? 'fill' $$,
    tests.id('a', 'selector')
  ),
  'Markeringene lagrer aldri status eller farge'
);
select tests.logout();

-- Statusendring vises uten ny publisering. Endrede former vises først etter publisering.
select tests.login_as(tests.id('a', 'agent'));
select public.set_unit_status(array[tests.id('a', 'unit_available')], 'sold', null, 'selector');
select tests.logout();
select tests.login_as(tests.id('a', 'editor'));
update public.hotspots set points = '[[0.2, 0.2], [0.4, 0.2], [0.4, 0.5]]' where id = tests.id('a', 'hotspot_unit');
select tests.logout();

select tests.login_as_anon();
select is(
  (select u ->> 'status' from jsonb_array_elements(public.get_published_selector(tests.id('a', 'selector')) -> 'units') u
   where u ->> 'unit_number' = 'A-101'),
  'sold',
  'Statusendringen vises i publisert velger uten ny publisering'
);
select is(
  (select h -> 'points' from jsonb_path_query(public.get_published_selector(tests.id('a', 'selector')), '$.selector.views[*].hotspots[*]') h
   where h ->> 'id' = tests.id('a', 'hotspot_unit')::text),
  '[[0.1, 0.2], [0.3, 0.2], [0.3, 0.4], [0.1, 0.4]]'::jsonb,
  'Endrede former går ikke ut før de publiseres'
);
select tests.logout();

select tests.login_as(tests.id('a', 'editor'));
select isnt(public.publish_selector(tests.id('a', 'selector')), null, 'Redaktør kan publisere boligvelgeren');
select is(
  (select h -> 'points' from jsonb_path_query(public.get_selector_preview(tests.id('a', 'selector')), '$.selector.views[*].hotspots[*]') h
   where h ->> 'id' = tests.id('a', 'hotspot_unit')::text),
  '[[0.2, 0.2], [0.4, 0.2], [0.4, 0.5]]'::jsonb,
  'Forhåndsvisningen viser utkastet'
);
select tests.logout();

select tests.login_as_anon();
select is(
  (select h -> 'points' from jsonb_path_query(public.get_published_selector(tests.id('a', 'selector')), '$.selector.views[*].hotspots[*]') h
   where h ->> 'id' = tests.id('a', 'hotspot_unit')::text),
  '[[0.2, 0.2], [0.4, 0.2], [0.4, 0.5]]'::jsonb,
  'Etter publisering vises de nye formene'
);
select tests.logout();

update public.projects set settings = settings || '{"show_price_on_sold": true}' where id = tests.id('a', 'project');
select tests.login_as_anon();
select is(
  (select (u ->> 'price')::bigint from jsonb_array_elements(public.get_published_selector(tests.id('a', 'selector')) -> 'units') u
   where u ->> 'unit_number' = 'A-302'),
  6950000::bigint,
  'Prisen vises på solgte enheter når prosjektet tillater det'
);

-- -----------------------------------------------------------------------------
-- Enhetsside og enhetsliste
-- -----------------------------------------------------------------------------
select is(
  public.get_public_unit(tests.id('a', 'project'), 'a-101') ->> 'unit_number',
  'A-101',
  'Enhetssiden /bolig/a-101 kan hentes'
);
select is(public.get_public_unit(tests.id('a', 'project'), 'a-303'), null, 'Skjulte enheter har ingen offentlig enhetsside');
select ok(
  public.get_public_unit(tests.id('a', 'project'), 'a-101') -> 'contacts' -> 0 ? 'name'
  and not (public.get_public_unit(tests.id('a', 'project'), 'a-101') -> 'contacts' -> 0 ? 'user_id')
  and not (public.get_public_unit(tests.id('a', 'project'), 'a-101') -> 'contacts' -> 0 ? 'receives_leads'),
  'Meglerkortet viser kontaktinfo, men ikke interne felt'
);
select is(
  jsonb_array_length(public.get_public_units(tests.id('a', 'project')) -> 'units'),
  2,
  'Enhetslisten har bare synlige enheter'
);
select is(public.get_public_units(tests.id('a', 'project_other')), null, 'Prosjekter uten publisering er ikke offentlige');
select tests.logout();

-- -----------------------------------------------------------------------------
-- Prosjektside: utkast og publisert er adskilt
-- -----------------------------------------------------------------------------
select tests.login_as(tests.id('a', 'editor'));
update public.pages
   set draft_blocks = draft_blocks || '[{"id": "b9", "type": "text", "props": {"text": "NYTT-UTKAST"}}]'
 where id = tests.id('a', 'page_home');
select tests.logout();

select tests.login_as_anon();
select is(
  public.resolve_site(p_subdomain => 'a-prosjekt') -> 'site' ->> 'id',
  tests.id('a', 'site')::text,
  'Prosjektsiden finnes på underdomenet'
);
select is(
  public.resolve_site(p_hostname => 'www.a-prosjekt.test') -> 'site' ->> 'id',
  tests.id('a', 'site')::text,
  'Prosjektsiden finnes på eget, bekreftet domene'
);
select ok(
  public.get_published_page(tests.id('a', 'site'))::text not like '%SKJULT-UTKAST%'
  and public.get_published_page(tests.id('a', 'site'))::text not like '%NYTT-UTKAST%',
  'Publisert forside viser verken skjulte blokker eller upubliserte endringer'
);
select tests.logout();

insert into public.domains (organization_id, project_id, site_id, hostname)
values (tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'site'), 'ubekreftet.a-prosjekt.test');
select tests.login_as_anon();
select is(public.resolve_site(p_hostname => 'ubekreftet.a-prosjekt.test'), null, 'Ubekreftede domener brukes ikke');
select tests.logout();

select tests.login_as(tests.id('a', 'editor'));
select isnt(public.publish_site(tests.id('a', 'site')), null, 'Redaktør kan publisere prosjektsiden');
select tests.logout();

select tests.login_as_anon();
select ok(
  public.get_published_page(tests.id('a', 'site'))::text like '%NYTT-UTKAST%'
  and public.get_published_page(tests.id('a', 'site'))::text not like '%SKJULT-UTKAST%',
  'Etter publisering vises endringene, men fortsatt ikke skjulte blokker'
);
select tests.logout();

select is(
  (select array_agg(version order by version) from public.page_versions where page_id = tests.id('a', 'page_home')),
  array[1, 2],
  'Hver publisering av en endret side gir en ny versjon'
);

select * from finish();
rollback;
