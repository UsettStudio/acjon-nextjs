-- =============================================================================
-- 0003 Tilgangsfunksjoner
-- =============================================================================
--
-- Rollemodell (avgjøres i databasen, speiles i grensesnittet og på server):
--
--   Rolle           Organisasjon            Prosjekter
--   owner  (Eier)   alt, inkl. abonnement   alle i organisasjonen
--   admin  (Admin)  alt unntatt abonnement  alle i organisasjonen
--   editor (Redaktør) –                     tildelte: innhold, enheter, boligvelger, sider
--   agent  (Megler)   –                     tildelte: status og pris på enheter, leads
--   Plattformadmin  lesetilgang til alt unntatt leads og webhook-hemmeligheter
--
-- Funksjonene er SECURITY DEFINER slik at de kan lese memberships uten å
-- utløse RLS rekursivt. De returnerer mengder av id-er og brukes i policyer som
--   project_id in (select app.project_ids_with_role(...))
-- Postgres evaluerer da funksjonen én gang per spørring, ikke én gang per rad.
--
-- Lesemodus: Når p_writable_only er true tas bare organisasjoner med gyldig
-- prøveperiode eller aktivt abonnement med. Alle skrivepolicyer bruker dette,
-- slik at en organisasjon med utløpt abonnement bare kan lese.

-- Rollegrupper brukt i policyene
create function app.roles_all()
returns public.member_role[]
language sql
immutable
set search_path = ''
as $$ select array['owner', 'admin', 'editor', 'agent']::public.member_role[] $$;

create function app.roles_admin()
returns public.member_role[]
language sql
immutable
set search_path = ''
as $$ select array['owner', 'admin']::public.member_role[] $$;

-- Redigere innhold: prosjektinfo, enheter, boligvelger, prosjektsider, filer.
create function app.roles_content()
returns public.member_role[]
language sql
immutable
set search_path = ''
as $$ select array['owner', 'admin', 'editor']::public.member_role[] $$;

-- Endre status og pris på enheter.
create function app.roles_sales()
returns public.member_role[]
language sql
immutable
set search_path = ''
as $$ select array['owner', 'admin', 'editor', 'agent']::public.member_role[] $$;

-- Se og behandle leads.
create function app.roles_leads()
returns public.member_role[]
language sql
immutable
set search_path = ''
as $$ select array['owner', 'admin', 'agent']::public.member_role[] $$;

create function app.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins pa where pa.user_id = (select auth.uid())
  );
$$;

-- Organisasjoner der innlogget bruker har en av rollene.
create function app.org_ids_with_role(
  p_roles public.member_role[] default null,
  p_writable_only boolean default false
)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.organization_id
  from public.memberships m
  join public.organizations o on o.id = m.organization_id
  where m.user_id = (select auth.uid())
    and (p_roles is null or m.role = any (p_roles))
    and (not p_writable_only or app.subscription_allows_writes(o.subscription_status, o.trial_ends_at));
$$;

-- Prosjekter der innlogget bruker har en av rollene. Eier og administrator har
-- tilgang til alle prosjekter i organisasjonen; redaktør og megler bare til
-- prosjekter de er tildelt i project_members.
create function app.project_ids_with_role(
  p_roles public.member_role[] default null,
  p_writable_only boolean default false
)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.memberships m
  join public.organizations o on o.id = m.organization_id
  join public.projects p on p.organization_id = m.organization_id
  where m.user_id = (select auth.uid())
    and (p_roles is null or m.role = any (p_roles))
    and (not p_writable_only or app.subscription_allows_writes(o.subscription_status, o.trial_ends_at))
    and (
      m.role in ('owner', 'admin')
      or exists (
        select 1
        from public.project_members pm
        where pm.project_id = p.id and pm.user_id = m.user_id
      )
    );
$$;

-- Enkeltsjekk for bruk i triggere og funksjoner.
create function app.has_project_role(
  p_project_id uuid,
  p_roles public.member_role[],
  p_writable_only boolean default true
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from app.project_ids_with_role(p_roles, p_writable_only) as ids(id)
    where ids.id = p_project_id
  );
$$;

create function app.has_org_role(
  p_organization_id uuid,
  p_roles public.member_role[],
  p_writable_only boolean default true
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from app.org_ids_with_role(p_roles, p_writable_only) as ids(id)
    where ids.id = p_organization_id
  );
$$;

-- Brukere som deler minst én organisasjon med innlogget bruker (for navn i logger og lister).
create function app.visible_user_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select distinct other.user_id
  from public.memberships mine
  join public.memberships other on other.organization_id = mine.organization_id
  where mine.user_id = (select auth.uid());
$$;

-- Et prosjekt er offentlig når det har en publisert boligvelger eller prosjektside.
create function app.project_is_public(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
      select 1 from public.selectors s
      where s.project_id = p_project_id and s.published_at is not null
    )
    or exists (
      select 1 from public.sites s
      where s.project_id = p_project_id and s.published_at is not null
    );
$$;

grant execute on function
  app.roles_all(),
  app.roles_admin(),
  app.roles_content(),
  app.roles_sales(),
  app.roles_leads(),
  app.is_platform_admin(),
  app.org_ids_with_role(public.member_role[], boolean),
  app.project_ids_with_role(public.member_role[], boolean),
  app.has_project_role(uuid, public.member_role[], boolean),
  app.has_org_role(uuid, public.member_role[], boolean),
  app.visible_user_ids()
to authenticated, service_role;

grant execute on function app.project_is_public(uuid) to service_role;
