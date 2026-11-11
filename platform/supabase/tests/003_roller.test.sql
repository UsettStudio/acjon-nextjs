-- =============================================================================
-- Rollekontroll i databasen: eier, administrator, redaktør, megler,
-- plattformadmin, lesemodus og invitasjoner.
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');

select plan(41);

-- -----------------------------------------------------------------------------
-- Eier og administrator
-- -----------------------------------------------------------------------------
select tests.login_as(tests.id('a', 'owner'));
select is(
  tests.affected_rows(format($$ update public.organizations set name = 'Nytt navn AS' where id = %L $$, tests.id('a', 'org'))),
  '1',
  'Eier kan endre organisasjonens navn'
);
select is(
  tests.sqlstate_of(format($$ update public.organizations set subscription_status = 'active' where id = %L $$, tests.id('a', 'org'))),
  '42501',
  'Ingen innloggede brukere kan endre abonnementsstatus (bare Stripe-webhooken)'
);
select is(
  tests.sqlstate_of(format($$ update public.organizations set plan = 'pro' where id = %L $$, tests.id('a', 'org'))),
  '42501',
  'Ingen innloggede brukere kan endre plan direkte'
);
select is(
  tests.affected_rows(format($$ insert into public.projects (organization_id, name, slug) values (%L, 'Nytt', 'nytt') $$, tests.id('a', 'org'))),
  '1',
  'Eier kan opprette prosjekter'
);
select is(
  tests.sqlstate_of(format($$ delete from public.memberships where user_id = %L $$, tests.id('a', 'owner'))),
  '23514',
  'Siste eier kan ikke forlate organisasjonen'
);
select is(
  tests.sqlstate_of(format($$ update public.memberships set role = 'admin' where user_id = %L $$, tests.id('a', 'owner'))),
  '23514',
  'Siste eier kan ikke fjerne sin egen eierrolle'
);
select is(
  tests.affected_rows(format($$ update public.memberships set role = 'owner' where user_id = %L $$, tests.id('a', 'admin'))),
  '1',
  'Eier kan gjøre en administrator til eier'
);
select is(
  tests.affected_rows(format($$ update public.memberships set role = 'admin' where user_id = %L $$, tests.id('a', 'owner'))),
  '1',
  'Når det finnes en annen eier, kan eieren gi fra seg rollen'
);
select tests.logout();
-- Tilbake til utgangspunktet: a-owner er eier, a-admin er admin.
update public.memberships set role = 'owner' where user_id = tests.id('a', 'owner');
update public.memberships set role = 'admin' where user_id = tests.id('a', 'admin');

select tests.login_as(tests.id('a', 'admin'));
select is(
  tests.affected_rows(format($$ update public.memberships set role = 'admin' where user_id = %L $$, tests.id('a', 'owner'))),
  '0',
  'Administrator kan ikke endre rollen til en eier'
);
select is(
  tests.sqlstate_of(format($$ update public.memberships set role = 'owner' where user_id = %L $$, tests.id('a', 'editor'))),
  '42501',
  'Administrator kan ikke gjøre noen til eier'
);
select is(
  tests.affected_rows(format($$ update public.memberships set role = 'agent' where user_id = %L $$, tests.id('a', 'editor'))),
  '1',
  'Administrator kan endre rollen til en redaktør'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.invitations (organization_id, email, role, token_hash) values (%L, 'ny-eier@example.test', 'owner', %L) $$,
    tests.id('a', 'org'), repeat('a', 64)
  )),
  '42501',
  'Administrator kan ikke invitere eiere'
);
select is(
  tests.affected_rows(format(
    $$ insert into public.invitations (organization_id, email, role, project_ids, token_hash) values (%L, 'ny-megler@example.test', 'agent', array[%L]::uuid[], %L) $$,
    tests.id('a', 'org'), tests.id('a', 'project'), repeat('b', 64)
  )),
  '1',
  'Administrator kan invitere en megler med prosjekttilgang'
);
select is(
  (select count(*)::int from public.leads),
  1,
  'Administrator ser leads'
);
select tests.logout();
update public.memberships set role = 'editor' where user_id = tests.id('a', 'editor');

-- -----------------------------------------------------------------------------
-- Redaktør: innhold i tildelte prosjekter
-- -----------------------------------------------------------------------------
select tests.login_as(tests.id('a', 'editor'));
select is(
  (select count(*)::int from public.projects),
  1,
  'Redaktør ser bare tildelte prosjekter'
);
select is(
  tests.affected_rows(format($$ update public.projects set description = 'Ny tekst' where id = %L $$, tests.id('a', 'project'))),
  '1',
  'Redaktør kan endre prosjektinfo i tildelt prosjekt'
);
select is(
  tests.affected_rows(format($$ update public.projects set description = 'Ny tekst' where id = %L $$, tests.id('a', 'project_other'))),
  '0',
  'Redaktør kan ikke endre et prosjekt hen ikke er tildelt'
);
select is(
  tests.sqlstate_of(format($$ insert into public.projects (organization_id, name, slug) values (%L, 'X', 'x') $$, tests.id('a', 'org'))),
  '42501',
  'Redaktør kan ikke opprette prosjekter'
);
select is(
  tests.affected_rows(format(
    $$ insert into public.units (organization_id, project_id, unit_number) values (%L, %L, 'B-101') $$,
    tests.id('a', 'org'), tests.id('a', 'project')
  )),
  '1',
  'Redaktør kan opprette enheter i tildelt prosjekt'
);
select is(
  tests.affected_rows(format($$ update public.units set description = 'Oppdatert' where id = %L $$, tests.id('a', 'unit_available'))),
  '1',
  'Redaktør kan endre alle felt på enheter'
);
select is((select count(*)::int from public.leads), 0, 'Redaktør ser ikke leads');
select is((select count(*)::int from public.audit_log), 0, 'Redaktør ser ikke revisjonsloggen');
select is(
  tests.sqlstate_of(format(
    $$ insert into public.domains (organization_id, project_id, site_id, hostname) values (%L, %L, %L, 'redaktor.example.test') $$,
    tests.id('a', 'org'), tests.id('a', 'project'), tests.id('a', 'site')
  )),
  '42501',
  'Redaktør kan ikke legge til domener'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Megler: status og pris i tildelte prosjekter, og leads
-- -----------------------------------------------------------------------------
select tests.login_as(tests.id('a', 'agent'));
select is(
  public.set_unit_status(array[tests.id('a', 'unit_available')], 'reserved', 'Budrunde', 'selector'),
  1,
  'Megler kan endre status'
);
select is(
  tests.affected_rows(format($$ update public.units set price = 4300000, purchase_costs = 107500 where id = %L $$, tests.id('a', 'unit_available'))),
  '1',
  'Megler kan endre pris'
);
select is(
  tests.sqlstate_of(format($$ update public.units set description = 'Megler skriver' where id = %L $$, tests.id('a', 'unit_available'))),
  '42501',
  'Megler kan ikke endre andre felt enn status og pris'
);
select is(
  tests.sqlstate_of(format(
    $$ insert into public.units (organization_id, project_id, unit_number) values (%L, %L, 'B-102') $$,
    tests.id('a', 'org'), tests.id('a', 'project')
  )),
  '42501',
  'Megler kan ikke opprette enheter'
);
select is((select count(*)::int from public.leads), 1, 'Megler ser leads i tildelt prosjekt');
select is(
  tests.affected_rows(format($$ update public.leads set status = 'contacted' where id = %L $$, tests.id('a', 'lead'))),
  '1',
  'Megler kan endre status på leads'
);
select is(
  tests.sqlstate_of(format($$ update public.leads set consent_contact = false where id = %L $$, tests.id('a', 'lead'))),
  '42501',
  'Samtykke på et lead kan ikke endres i etterkant'
);
select is(
  tests.affected_rows(format($$ delete from public.leads where id = %L $$, tests.id('a', 'lead'))),
  '0',
  'Megler kan ikke slette leads'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Lesemodus når abonnementet er utløpt
-- -----------------------------------------------------------------------------
update public.organizations
   set subscription_status = 'trialing', trial_ends_at = now() - interval '1 day'
 where id = tests.id('a', 'org');

select tests.login_as(tests.id('a', 'owner'));
select is((select count(*)::int from public.units), 4, 'Lesemodus: eier kan fortsatt lese');
select is(
  tests.affected_rows(format($$ update public.projects set description = 'X' where id = %L $$, tests.id('a', 'project'))),
  '0',
  'Lesemodus: eier kan ikke endre prosjekter'
);
select is(
  tests.sqlstate_of(format($$ select public.set_unit_status(array[%L]::uuid[], 'sold') $$, tests.id('a', 'unit_available'))),
  '42501',
  'Lesemodus: status kan ikke endres'
);
select is(
  tests.affected_rows(format($$ delete from public.leads where id = %L $$, tests.id('a', 'lead'))),
  '1',
  'Lesemodus: leads kan likevel slettes (GDPR)'
);
select tests.logout();

select tests.login_as_anon();
select isnt(
  public.get_published_selector(tests.id('a', 'selector')),
  null,
  'Lesemodus: publisert boligvelger er fortsatt tilgjengelig for kjøpere'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Plattformadmin: lesetilgang for support, men ikke leads og ingen skriving
-- -----------------------------------------------------------------------------
update public.organizations set subscription_status = 'active' where id = tests.id('a', 'org');
insert into public.leads (organization_id, project_id, name, email, consent_contact, consent_text_version)
values (tests.id('a', 'org'), tests.id('a', 'project'), 'Ola', 'ola@example.test', true, 'v1');

select tests.create_user('support@example.test', 'Support') as support_id \gset
insert into public.platform_admins (user_id) values (:'support_id');

select tests.login_as(:'support_id');
select is((select count(*)::int from public.units where organization_id = tests.id('a', 'org')), 4, 'Plattformadmin kan lese enheter i alle organisasjoner');
select is((select count(*)::int from public.leads), 0, 'Plattformadmin ser ikke leads');
select is(
  tests.affected_rows(format($$ update public.units set description = 'Support' where id = %L $$, tests.id('a', 'unit_available'))),
  '0',
  'Plattformadmin kan ikke endre data via vanlig tilgang'
);
select tests.logout();

-- -----------------------------------------------------------------------------
-- Invitasjoner
-- -----------------------------------------------------------------------------
select tests.create_user('a-ny@example.test', 'Ny Redaktør') as invited_id \gset
select tests.login_as(:'invited_id');
select is(
  public.accept_invitation('invitasjon-a'),
  tests.id('a', 'org'),
  'Invitert bruker med riktig e-postadresse kan godta invitasjonen'
);
select results_eq(
  format(
    $$ select m.role::text, (select count(*)::int from public.project_members pm where pm.user_id = %L)
       from public.memberships m where m.user_id = %L $$,
    :'invited_id', :'invited_id'
  ),
  $$ values ('editor', 1) $$,
  'Invitasjonen gir riktig rolle og prosjekttilgang'
);
select tests.logout();

select * from finish();
rollback;
