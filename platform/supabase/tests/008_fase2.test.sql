-- =============================================================================
-- Fase 2: lagring av markeringer, rekkefølge på visninger og publiseringsstatus
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');
select tests.seed_organization('b');

select plan(33);

-- Utgangspunktet: bygg-visningen har to markeringer (A-101 og A-302), og velgeren er publisert.
select tests.login_as(tests.id('a', 'editor'));
select is(
  public.get_selector_publish_state(tests.id('a', 'selector')) ->> 'has_changes',
  'false',
  'Rett etter publisering er det ingen upubliserte endringer'
);

-- -----------------------------------------------------------------------------
-- save_view_hotspots
-- -----------------------------------------------------------------------------

select is(
  public.save_view_hotspots(
    tests.id('a', 'view_building'),
    jsonb_build_array(
      jsonb_build_object(
        'id', tests.id('a', 'hotspot_unit'), 'shape', 'polygon',
        'points', '[[0.1, 0.2], [0.3, 0.2], [0.3, 0.45], [0.1, 0.45]]'::jsonb,
        'target_type', 'unit', 'target_unit_id', tests.id('a', 'unit_available'), 'label', ' A-101 '
      ),
      jsonb_build_object(
        'id', '00000000-0000-4000-8000-0000000000a1', 'shape', 'rect',
        'points', '[[0.5, 0.5], [0.7, 0.8]]'::jsonb, 'target_type', null
      )
    )
  ),
  2,
  'Redaktør lagrer markeringene i en visning'
);
select results_eq(
  format(
    $$ select id::text, shape::text, sort_order, label, target_type::text from public.hotspots
       where view_id = %L order by sort_order $$,
    tests.id('a', 'view_building')
  ),
  format(
    $$ values (%L, 'polygon', 1, 'A-101', 'unit'), ('00000000-0000-4000-8000-0000000000a1', 'rect', 2, null, null) $$,
    tests.id('a', 'hotspot_unit')
  ),
  'Endret markering beholder id-en, ny markering legges til, og rekkefølgen følger listen'
);
select is(
  (select count(*)::integer from public.hotspots where id = tests.id('a', 'hotspot_sold')),
  0,
  'Markeringer som ikke er med i listen, slettes'
);
select is(
  public.get_selector_publish_state(tests.id('a', 'selector')) ->> 'has_changes',
  'true',
  'Endringene vises som upubliserte'
);
select is(
  (select count(*)::integer from jsonb_path_query(
     public.get_published_selector(tests.id('a', 'selector')), '$.selector.views[*].hotspots[*]')),
  3,
  'Den publiserte velgeren er uendret til neste publisering'
);

select is(
  tests.sqlstate_of(format(
    $$ select public.save_view_hotspots(%L, '[{"id": "00000000-0000-4000-8000-0000000000a2", "shape": "polygon", "points": [[0.1, 0.1], [0.2, 0.2]]}]') $$,
    tests.id('a', 'view_building')
  )),
  '23514',
  'Et polygon må ha minst tre punkter'
);
select is(
  (select count(*)::integer from public.hotspots where view_id = tests.id('a', 'view_building')),
  2,
  'En ugyldig markering stopper hele lagringen'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.save_view_hotspots(%L, '[{"id": "00000000-0000-4000-8000-0000000000a3", "shape": "rect", "points": [[0.1, 0.1], [1.2, 0.2]]}]') $$,
    tests.id('a', 'view_building')
  )),
  '23514',
  'Punkter utenfor bildet avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.save_view_hotspots(%L, jsonb_build_array(jsonb_build_object(
         'id', %L, 'shape', 'rect', 'points', '[[0.1, 0.1], [0.2, 0.2]]'::jsonb))) $$,
    tests.id('a', 'view_building'), tests.id('a', 'hotspot_view')
  )),
  '23505',
  'En markering fra en annen visning kan ikke flyttes hit med samme id'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.save_view_hotspots(%L, jsonb_build_array(jsonb_build_object(
         'id', '00000000-0000-4000-8000-0000000000a4', 'shape', 'rect', 'points', '[[0.1, 0.1], [0.2, 0.2]]'::jsonb,
         'target_type', 'unit', 'target_unit_id', %L))) $$,
    tests.id('a', 'view_building'), tests.id('b', 'unit_available')
  )),
  '23503',
  'En markering kan ikke kobles til en enhet i et annet prosjekt'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.save_view_hotspots(%L, jsonb_build_array(jsonb_build_object(
         'id', '00000000-0000-4000-8000-0000000000a5', 'shape', 'rect', 'points', '[[0.1, 0.1], [0.2, 0.2]]'::jsonb,
         'target_type', 'view', 'target_view_id', %L))) $$,
    tests.id('a', 'view_building'), tests.id('b', 'view_overview')
  )),
  '23503',
  'En markering kan bare lenke til visninger i samme boligvelger'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.save_view_hotspots(%L, '[{"id": "00000000-0000-4000-8000-0000000000a6", "shape": "rect", "points": [[0.1, 0.1], [0.2, 0.2]], "target_type": "url", "target_url": "javascript:alert(1)"}]') $$,
    tests.id('a', 'view_building')
  )),
  '23514',
  'Lenker må være http eller https'
);
select tests.logout();

select tests.login_as(tests.id('a', 'agent'));
select is(
  tests.sqlstate_of(format($$ select public.save_view_hotspots(%L, '[]') $$, tests.id('a', 'view_building'))),
  '42501',
  'Megler kan ikke endre markeringer'
);
select is(
  public.get_selector_publish_state(tests.id('a', 'selector')) ->> 'has_changes',
  'true',
  'Megler kan se om det finnes upubliserte endringer'
);
select tests.logout();

select tests.login_as(tests.id('b', 'owner'));
select is(
  tests.sqlstate_of(format($$ select public.save_view_hotspots(%L, '[]') $$, tests.id('a', 'view_building'))),
  '42501',
  'Eier i en annen organisasjon kan ikke endre markeringer her'
);
select is(
  tests.sqlstate_of(format($$ select public.get_selector_publish_state(%L) $$, tests.id('a', 'selector'))),
  '42501',
  'Og kan ikke se publiseringsstatus'
);
select tests.logout();

update public.organizations set subscription_status = 'canceled' where id = tests.id('a', 'org');
select tests.login_as(tests.id('a', 'owner'));
select is(
  tests.sqlstate_of(format($$ select public.save_view_hotspots(%L, '[]') $$, tests.id('a', 'view_building'))),
  '42501',
  'Ingen kan endre markeringer i lesemodus'
);
select tests.logout();
update public.organizations set subscription_status = 'active' where id = tests.id('a', 'org');

-- -----------------------------------------------------------------------------
-- reorder_selector_views
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'editor'));
insert into public.selector_views (id, organization_id, project_id, selector_id, parent_view_id, name, kind)
values ('00000000-0000-4000-8000-0000000000b1', tests.id('a', 'org'), tests.id('a', 'project'),
        tests.id('a', 'selector'), tests.id('a', 'view_overview'), 'Bygg B', 'facade');
select lives_ok(
  format($$ select public.reorder_selector_views(%L, array['00000000-0000-4000-8000-0000000000b1', %L]::uuid[]) $$,
         tests.id('a', 'selector'), tests.id('a', 'view_building')),
  'Redaktør endrer rekkefølgen på visninger'
);
select results_eq(
  format($$ select name from public.selector_views where parent_view_id = %L order by sort_order $$, tests.id('a', 'view_overview')),
  $$ values ('Bygg B'), ('Bygg A') $$,
  'Visningene har ny rekkefølge'
);
select is(
  tests.sqlstate_of(format($$ select public.reorder_selector_views(%L, array[%L]::uuid[]) $$,
         tests.id('a', 'selector'), tests.id('b', 'view_overview'))),
  '22023',
  'Visninger fra en annen boligvelger avvises'
);
select tests.logout();

select tests.login_as(tests.id('a', 'agent'));
select is(
  tests.sqlstate_of(format($$ select public.reorder_selector_views(%L, array[%L]::uuid[]) $$,
         tests.id('a', 'selector'), tests.id('a', 'view_building'))),
  '42501',
  'Megler kan ikke endre rekkefølgen'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Publisering og oppslag uten innlogging
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'editor'));
select isnt(public.publish_selector(tests.id('a', 'selector')), null, 'Redaktør publiserer endringene');
select is(
  public.get_selector_publish_state(tests.id('a', 'selector')) ->> 'has_changes',
  'false',
  'Etter publisering er det ingen upubliserte endringer'
);
select tests.logout();

select tests.login_as_anon();
select is(
  public.get_published_selector_project(tests.id('a', 'selector')),
  tests.id('a', 'project'),
  'Uten innlogging gir en publisert velger prosjektet sitt'
);
select tests.logout();

select tests.login_as(tests.id('a', 'editor'));
select public.unpublish_selector(tests.id('a', 'selector'));
select tests.logout();
select tests.login_as_anon();
select is(
  public.get_published_selector_project(tests.id('a', 'selector')),
  null,
  'En avpublisert velger gir ingenting'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Statusfarger og pris på solgte enheter per prosjekt
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'editor'));
select lives_ok(
  format($$ select public.set_project_display_settings(%L, '{"sold": "#112233"}'::jsonb, true) $$, tests.id('a', 'project')),
  'Redaktør setter egne statusfarger og viser pris på solgte'
);
select is(
  (select settings -> 'status_colors' ->> 'sold' from public.projects where id = tests.id('a', 'project')),
  '#112233',
  'Fargen er lagret'
);
select is(
  (select (settings ->> 'show_price_on_sold')::boolean from public.projects where id = tests.id('a', 'project')),
  true,
  'Innstillingen for pris på solgte er lagret'
);
select is(
  (select settings ? 'public_custom_fields' from public.projects where id = tests.id('a', 'project')),
  (select true),
  'Andre prosjektinnstillinger beholdes'
);
select is(
  tests.sqlstate_of(format($$ select public.set_project_display_settings(%L, '{"sold": "red; x"}'::jsonb, false) $$, tests.id('a', 'project'))),
  '22023',
  'Ugyldig farge avvises'
);
select is(
  tests.sqlstate_of(format($$ select public.set_project_display_settings(%L, '{"pink": "#112233"}'::jsonb, false) $$, tests.id('a', 'project'))),
  '22023',
  'Ukjent status avvises'
);
select tests.logout();

select tests.login_as(tests.id('a', 'agent'));
select is(
  tests.sqlstate_of(format($$ select public.set_project_display_settings(%L, '{}'::jsonb, false) $$, tests.id('a', 'project'))),
  '42501',
  'Megler kan ikke endre visningsinnstillingene'
);
select tests.logout();

select * from finish();
rollback;
