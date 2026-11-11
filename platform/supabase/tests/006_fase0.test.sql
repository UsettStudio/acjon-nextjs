-- =============================================================================
-- Fase 0: invitasjonsoppslag og reserverte organisasjonsadresser
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;

select tests.seed_organization('a');

select plan(11);

select tests.login_as_anon();
select results_eq(
  $$ select x ->> 'organization_name', x ->> 'email', x ->> 'role', x ->> 'status'
     from public.get_invitation('invitasjon-a') as x $$,
  $$ values ('Organisasjon A', 'a-ny@example.test', 'editor', 'pending') $$,
  'Invitasjonssiden kan slå opp en gyldig invitasjon uten innlogging'
);
select is(public.get_invitation('feil-token'), null, 'Ukjent token gir ingen invitasjon');
select ok(
  public.get_invitation('invitasjon-a')::text not like '%token_hash%',
  'Oppslaget viser ikke hashen av tokenet'
);
select tests.logout();

update public.invitations set expires_at = now() - interval '1 minute' where id = tests.id('a', 'invitation');
select tests.login_as_anon();
select is(public.get_invitation('invitasjon-a') ->> 'status', 'expired', 'Utløpte invitasjoner vises som utløpt');
select tests.logout();

update public.invitations set expires_at = now() + interval '1 day', revoked_at = now() where id = tests.id('a', 'invitation');
select tests.login_as_anon();
select is(public.get_invitation('invitasjon-a') ->> 'status', 'revoked', 'Tilbakekalte invitasjoner vises som tilbakekalt');
select tests.logout();

select tests.login_as(tests.id('a', 'owner'));
select is(
  tests.sqlstate_of($$ select public.create_organization('Innlogging AS', 'login') $$),
  '23514',
  'En organisasjon kan ikke få en adresse appen bruker selv'
);
select is(
  tests.sqlstate_of(format($$ update public.organizations set slug = 'settings' where id = %L $$, tests.id('a', 'org'))),
  '23514',
  'Adressen kan heller ikke endres til en reservert adresse'
);
select results_eq(
  format(
    $$ select p.full_name from public.memberships m join public.profiles p on p.id = m.user_id
       where m.organization_id = %L and m.role = 'agent' $$,
    tests.id('a', 'org')
  ),
  $$ values ('Megler A') $$,
  'Medlemskap kan kobles til profilen med navn'
);
select tests.logout();

-- Prosjekttilgang settes samlet
select tests.login_as(tests.id('a', 'admin'));
select lives_ok(
  format($$ select public.set_project_access(%L, %L, array[%L]::uuid[]) $$,
         tests.id('a', 'org'), tests.id('a', 'editor'), tests.id('a', 'project_other')),
  'Administrator kan sette prosjekttilgang for en redaktør'
);
select results_eq(
  format($$ select project_id from public.project_members where user_id = %L $$, tests.id('a', 'editor')),
  format($$ values (%L::uuid) $$, tests.id('a', 'project_other')),
  'Redaktøren har nå bare tilgang til det valgte prosjektet'
);
select tests.logout();

select tests.login_as(tests.id('a', 'editor'));
select is(
  tests.sqlstate_of(format($$ select public.set_project_access(%L, %L, array[%L]::uuid[]) $$,
         tests.id('a', 'org'), tests.id('a', 'agent'), tests.id('a', 'project_other'))),
  '42501',
  'Redaktør kan ikke gi andre prosjekttilgang'
);
select tests.logout();

select * from finish();
rollback;
