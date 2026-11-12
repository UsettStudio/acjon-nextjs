-- =============================================================================
-- Fase 3: prosjektside fra mal, forside, rekkefølge, versjoner, publiseringsstatus,
-- offentlige egne felt og leads fra serveren
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');
select tests.seed_organization('b');

select plan(52);

-- Mal med to sider: forside og boliger. Menyen peker på side-id-ene.
create temporary table mal (sider jsonb, innstillinger jsonb) on commit drop;
insert into mal values (
  '[{"id": "00000000-0000-4000-8000-0000000000c1", "title": "Forside", "slug": "forside", "is_home": true,
     "blocks": [{"id": "h1", "type": "hero", "props": {"title": "Velkommen"}}]},
    {"id": "00000000-0000-4000-8000-0000000000c2", "title": "Boliger", "slug": "boliger", "is_home": false,
     "blocks": []}]',
  '{"nav": [{"id": "n1", "label": "Boliger", "page_id": "00000000-0000-4000-8000-0000000000c2"}],
    "theme": {"colors": {"primary": "#1F4E79"}}, "footer": {"text": "Annet prosjekt AS"}}'
);
grant select on mal to authenticated, anon, service_role;

-- -----------------------------------------------------------------------------
-- create_site
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.sqlstate_of(format(
    $$ select public.create_site(%L, 'annet-a', '{}', '[{"title": "A", "slug": "a", "is_home": true}, {"title": "B", "slug": "b", "is_home": true}]') $$,
    tests.id('a', 'project_other'))),
  '22023',
  'To forsider avvises'
);
select is(
  tests.sqlstate_of(format($$ select public.create_site(%L, 'annet-a', '{}', '[]') $$, tests.id('a', 'project_other'))),
  '22023',
  'En prosjektside uten sider avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.create_site(%L, 'app', '{}', '[{"title": "Forside", "slug": "forside", "is_home": true}]') $$,
    tests.id('a', 'project_other'))),
  '23514',
  'Reservert underdomene avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.create_site(%L, 'a-prosjekt', '{}', '[{"title": "Forside", "slug": "forside", "is_home": true}]') $$,
    tests.id('a', 'project_other'))),
  '23505',
  'Underdomene som er i bruk, avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.create_site(%L, 'annet-a', '{}', '[{"title": "Bolig", "slug": "bolig", "is_home": true}]') $$,
    tests.id('a', 'project_other'))),
  '23514',
  'Reservert sideadresse (bolig) avvises'
);
select isnt(
  public.create_site(tests.id('a', 'project_other'), ' Annet-A ', (select innstillinger from mal), (select sider from mal)),
  null,
  'Admin oppretter prosjektside fra mal'
);
select results_eq(
  $$ select p.title, p.is_home, p.sort_order from public.pages p
     join public.sites s on s.id = p.site_id where s.subdomain = 'annet-a' order by p.sort_order $$,
  $$ values ('Forside', true, 1), ('Boliger', false, 2) $$,
  'Sidene er lagret i rekkefølge med én forside, og underdomenet er normalisert'
);
select is(
  (select nav -> 0 ->> 'page_id' from public.sites where subdomain = 'annet-a'),
  '00000000-0000-4000-8000-0000000000c2',
  'Menyen peker på siden med id-en fra malen'
);
select is(
  (select draft_blocks -> 0 ->> 'type' from public.pages where id = '00000000-0000-4000-8000-0000000000c1'),
  'hero',
  'Blokkene fra malen ligger i utkastet'
);
select is(
  (select count(*)::integer from public.audit_log where action = 'site.created' and organization_id = tests.id('a', 'org')),
  1,
  'Opprettelsen står i revisjonsloggen'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.create_site(%L, 'annet-a-to', '{}', '[{"title": "Forside", "slug": "forside", "is_home": true}]') $$,
    tests.id('a', 'project_other'))),
  '23505',
  'Et prosjekt har bare én prosjektside'
);
select tests.logout();

select tests.login_as(tests.id('a', 'editor'));
select is(
  tests.sqlstate_of(format(
    $$ select public.create_site(%L, 'redaktor-a', '{}', '[{"title": "Forside", "slug": "forside", "is_home": true}]') $$,
    tests.id('a', 'project_other'))),
  '42501',
  'Redaktør uten tilgang til prosjektet kan ikke opprette prosjektside'
);
select tests.logout();

select tests.login_as(tests.id('b', 'owner'));
select is(
  tests.sqlstate_of(format(
    $$ select public.create_site(%L, 'fremmed-b', '{}', '[{"title": "Forside", "slug": "forside", "is_home": true}]') $$,
    tests.id('a', 'project_other'))),
  '42501',
  'Eier i en annen organisasjon kan ikke opprette prosjektside'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Forside og rekkefølge
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'editor'));
select lives_ok(format('select public.set_home_page(%L)', tests.id('a', 'page_about')), 'Redaktør bytter forside');
select results_eq(
  format('select id from public.pages where site_id = %L and is_home', tests.id('a', 'site')),
  format('values (%L::uuid)', tests.id('a', 'page_about')),
  'Bare den nye forsiden er forside'
);
select lives_ok(
  format('select public.reorder_pages(%L, array[%L, %L]::uuid[])', tests.id('a', 'site'), tests.id('a', 'page_about'), tests.id('a', 'page_home')),
  'Redaktør endrer rekkefølgen på sidene'
);
select results_eq(
  format('select id from public.pages where site_id = %L order by sort_order', tests.id('a', 'site')),
  format('values (%L::uuid), (%L::uuid)', tests.id('a', 'page_about'), tests.id('a', 'page_home')),
  'Sidene har ny rekkefølge'
);
select is(
  tests.sqlstate_of(format('select public.reorder_pages(%L, array[%L]::uuid[])', tests.id('a', 'site'), tests.id('b', 'page_home'))),
  '22023',
  'Sider fra en annen prosjektside avvises'
);
select tests.logout();

select tests.login_as(tests.id('a', 'agent'));
select is(
  tests.sqlstate_of(format('select public.set_home_page(%L)', tests.id('a', 'page_home'))),
  '42501',
  'Megler kan ikke bytte forside'
);
select is(
  tests.sqlstate_of(format('select public.reorder_pages(%L, array[%L]::uuid[])', tests.id('a', 'site'), tests.id('a', 'page_home'))),
  '42501',
  'Megler kan ikke endre rekkefølgen'
);
select tests.logout();

select tests.login_as(tests.id('b', 'owner'));
select is(
  tests.sqlstate_of(format('select public.set_home_page(%L)', tests.id('a', 'page_home'))),
  '42501',
  'Eier i en annen organisasjon kan ikke bytte forside'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Publiseringsstatus
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'editor'));
select is(
  public.get_site_publish_state(tests.id('a', 'site')) ->> 'has_changes',
  'true',
  'Ny forside er en upublisert endring'
);
select isnt(public.publish_site(tests.id('a', 'site')), null, 'Redaktør publiserer');
select is(
  public.get_site_publish_state(tests.id('a', 'site')) ->> 'has_changes',
  'false',
  'Etter publisering er det ingen upubliserte endringer'
);
update public.pages
   set draft_blocks = jsonb_set(draft_blocks, '{2,props,text}', '"NY-SKJULT"')
 where id = tests.id('a', 'page_home');
select is(
  public.get_site_publish_state(tests.id('a', 'site')) ->> 'has_changes',
  'false',
  'Endring i en skjult blokk endrer ikke den publiserte siden'
);
update public.pages set title = 'Velkommen' where id = tests.id('a', 'page_home');
select is(
  public.get_site_publish_state(tests.id('a', 'site')) ->> 'has_changes',
  'true',
  'Ny tittel er en upublisert endring'
);
update public.sites set footer = '{"text": "Ny bunntekst"}' where id = tests.id('a', 'site');
select is(
  public.get_site_publish_state(tests.id('a', 'site')) ->> 'has_changes',
  'true',
  'Ny bunntekst er en upublisert endring'
);
select tests.logout();

select tests.login_as(tests.id('a', 'agent'));
select is(
  public.get_site_publish_state(tests.id('a', 'site')) ->> 'has_changes',
  'true',
  'Megler kan lese publiseringsstatus'
);
select tests.logout();

select tests.login_as(tests.id('b', 'owner'));
select is(
  tests.sqlstate_of(format('select public.get_site_publish_state(%L)', tests.id('a', 'site'))),
  '42501',
  'Eier i en annen organisasjon får ikke publiseringsstatus'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Gjenoppretting av versjon
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'editor'));
update public.pages set draft_blocks = '[]', seo_title = 'Midlertidig' where id = tests.id('a', 'page_home');
select lives_ok(
  format(
    'select public.restore_page_version((select id from public.page_versions where page_id = %L and version = 1))',
    tests.id('a', 'page_home')
  ),
  'Redaktør gjenoppretter versjon 1'
);
select is(
  (select jsonb_array_length(draft_blocks) from public.pages where id = tests.id('a', 'page_home')),
  3,
  'Alle blokkene fra versjonen er tilbake i utkastet, også den skjulte'
);
select results_eq(
  format('select title, seo_title, slug from public.pages where id = %L', tests.id('a', 'page_home')),
  $$ values ('Forside', null::text, 'forside') $$,
  'Tittel og SEO kommer fra versjonen, og adressen beholdes'
);
select tests.logout();
select is(
  (select count(*)::integer from public.audit_log where action = 'page.version_restored' and entity_id = tests.id('a', 'page_home')),
  1,
  'Gjenopprettingen står i revisjonsloggen'
);

select tests.login_as(tests.id('a', 'agent'));
select is(
  tests.sqlstate_of(format(
    'select public.restore_page_version((select id from public.page_versions where page_id = %L and version = 1))',
    tests.id('a', 'page_home'))),
  '42501',
  'Megler kan ikke gjenopprette versjoner'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Offentlige egne felt
-- -----------------------------------------------------------------------------

select tests.login_as(tests.id('a', 'editor'));
select lives_ok(
  format($$ select public.set_public_custom_fields(%L, array['solforhold', 'balkong', 'balkong']) $$, tests.id('a', 'project')),
  'Redaktør velger hvilke egne felt som er offentlige'
);
select is(
  (select settings -> 'public_custom_fields' from public.projects where id = tests.id('a', 'project')),
  '["balkong", "solforhold"]'::jsonb,
  'Feltnavnene er lagret uten duplikater'
);
select is(
  (select settings ? 'show_price_on_sold' from public.projects where id = tests.id('a', 'project')),
  true,
  'Andre prosjektinnstillinger beholdes'
);
select is(
  tests.sqlstate_of(format($$ select public.set_public_custom_fields(%L, array[' feil']) $$, tests.id('a', 'project'))),
  '22023',
  'Feltnavn med mellomrom rundt avvises'
);
select tests.logout();

select tests.login_as(tests.id('a', 'agent'));
select is(
  tests.sqlstate_of(format($$ select public.set_public_custom_fields(%L, array['x']) $$, tests.id('a', 'project'))),
  '42501',
  'Megler kan ikke endre offentlige egne felt'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Leads fra serveren
-- -----------------------------------------------------------------------------

create temporary table henvendelse (lead jsonb) on commit drop;
insert into henvendelse values (jsonb_build_object(
  'project_id', tests.id('a', 'project'),
  'unit_id', tests.id('a', 'unit_available'),
  'page_id', tests.id('a', 'page_home'),
  'name', ' Ola Nordmann ',
  'email', ' Ola@Example.TEST ',
  'phone', '+47 987 65 432',
  'message', 'Er A-101 fortsatt ledig?',
  'consent_contact', true,
  'consent_similar_projects', false,
  'consent_text_version', 'samtykke-2026-11-12',
  'source', 'unit_page',
  'utm', jsonb_build_object('utm_source', 'finn')
));
grant select on henvendelse to anon, authenticated, service_role;

select tests.login_as_anon();
select is(
  tests.sqlstate_of('select public.submit_lead((select lead from henvendelse))'),
  '42501',
  'Uten innlogging kan ingen legge inn leads direkte i databasen'
);
select tests.logout();

select tests.login_as(tests.id('a', 'owner'));
select is(
  tests.sqlstate_of('select public.submit_lead((select lead from henvendelse))'),
  '42501',
  'Heller ikke innloggede brukere kan kalle funksjonen'
);
select tests.logout();

select set_config('role', 'service_role', true);
select is(
  public.submit_lead((select lead from henvendelse), 'ip-1') ->> 'unit_number',
  'A-101',
  'Serveren legger inn leadet med enheten'
);
select results_eq(
  $$ select name, email, unit_number, source, page_id is not null, consent_text_version
     from public.leads where email = 'ola@example.test' $$,
  $$ values ('Ola Nordmann', 'ola@example.test', 'A-101', 'unit_page', true, 'samtykke-2026-11-12') $$,
  'Navn og e-post er renset, og enhet, side, kilde og samtykkeversjon er lagret'
);
select is(
  public.submit_lead((select lead || '{"email": "nr2@example.test"}' from henvendelse), 'ip-2') -> 'recipients',
  '["a-megler@example.test"]'::jsonb,
  'E-posten går til kontaktpersonen som tar imot leads'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.submit_lead((select lead || jsonb_build_object('unit_id', %L::text) from henvendelse), 'ip-3') $$,
    tests.id('a', 'unit_hidden'))),
  '23503',
  'Skjult enhet avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.submit_lead((select lead || jsonb_build_object('unit_id', %L::text) from henvendelse), 'ip-3') $$,
    tests.id('b', 'unit_available'))),
  '23503',
  'Enhet fra en annen organisasjon avvises'
);
select is(
  tests.sqlstate_of(format(
    $$ select public.submit_lead((select lead || jsonb_build_object('project_id', %L::text, 'unit_id', null) from henvendelse), 'ip-3') $$,
    tests.id('a', 'project_other'))),
  'P0002',
  'Prosjekt uten publisert side eller velger tar ikke imot henvendelser'
);
select is(
  tests.sqlstate_of($$ select public.submit_lead((select lead || '{"consent_contact": false, "email": "nei@example.test"}' from henvendelse), 'ip-3') $$),
  '23514',
  'Uten samtykke til kontakt lagres ingenting'
);
select ok(
  public.submit_lead(
    (select lead || jsonb_build_object('page_id', tests.id('b', 'page_home'), 'email', 'side@example.test') from henvendelse),
    'ip-4'
  ) ->> 'lead_id' is not null,
  'En side fra et annet prosjekt gir ingen feil'
);
select is(
  (select page_id from public.leads where email = 'side@example.test'),
  null,
  'Siden fra et annet prosjekt lagres ikke på leadet'
);
select is(
  (
    select count(*)::integer from generate_series(1, 6) as n
    where tests.sqlstate_of(format(
      $$ select public.submit_lead((select lead || jsonb_build_object('email', 'spam%s@example.test') from henvendelse), 'ip-spam') $$, n
    )) = 'P0429'
  ),
  1,
  'Den sjette henvendelsen fra samme adresse innen ti minutter stoppes'
);
update public.projects set contacts = '[]' where id = tests.id('a', 'project');
select is(
  public.submit_lead((select lead || '{"email": "uten-kontakt@example.test"}' from henvendelse), 'ip-5') -> 'recipients',
  '["a-admin@example.test", "a-eier@example.test"]'::jsonb,
  'Uten kontaktpersoner går e-posten til eiere og administratorer'
);
select tests.logout();

select * from finish();
rollback;
