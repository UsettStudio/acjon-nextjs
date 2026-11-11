-- =============================================================================
-- 0008 Fase 0: invitasjonsoppslag, reserverte adresser og profilkoblinger
-- =============================================================================

-- Organisasjonens slug brukes i admin-adressen (/{slug}/…). Ordene under er
-- adresser appen bruker selv, og kan derfor ikke være navnet på en organisasjon.
create function app.is_reserved_org_slug(p_value text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_value = any (array[
    'login', 'signup', 'logout', 'forgot-password', 'reset-password', 'auth', 'invite',
    'onboarding', 'account', 'platform', 'api', 'embed', 'sites', 'settings', 'admin',
    'app', 'www', 'help', 'support', 'static', 'assets', 'media', 'public', 'new'
  ]);
$$;

grant execute on function app.is_reserved_org_slug(text) to authenticated, service_role;

alter table public.organizations
  add constraint organizations_slug_not_reserved check (not app.is_reserved_org_slug(slug));

-- Profilkoblinger, slik at Data API kan hente navn og e-post sammen med
-- medlemskap og invitasjoner i én spørring. Profilen opprettes sammen med brukeren.
alter table public.memberships
  add constraint memberships_user_profile_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.invitations
  add constraint invitations_invited_by_profile_fkey
  foreign key (invited_by) references public.profiles (id) on delete set null;

-- Invitasjonssiden viser hvem som inviterer før mottakeren har konto eller er logget inn.
-- Tokenet i lenken er hemmeligheten. Bare en hash av det er lagret.
create function public.get_invitation(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'organization_name', o.name,
    'organization_slug', o.slug,
    'email', i.email,
    'role', i.role,
    'expires_at', i.expires_at,
    'status', case
      when i.accepted_at is not null then 'accepted'
      when i.revoked_at is not null then 'revoked'
      when i.expires_at <= now() then 'expired'
      else 'pending'
    end
  )
  from public.invitations i
  join public.organizations o on o.id = i.organization_id
  where i.token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex');
$$;

grant execute on function public.get_invitation(text) to anon, authenticated, service_role;

-- Setter hvilke prosjekter en redaktør eller megler har tilgang til, i én transaksjon.
-- Kjører med innlogget brukers rettigheter, så bare eier og admin kan endre (RLS).
create function public.set_project_access(p_organization_id uuid, p_user_id uuid, p_project_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.project_members pm
   where pm.organization_id = p_organization_id
     and pm.user_id = p_user_id
     and not (pm.project_id = any (coalesce(p_project_ids, '{}'::uuid[])));

  insert into public.project_members (organization_id, project_id, user_id)
  select p_organization_id, p.id, p_user_id
  from public.projects p
  where p.organization_id = p_organization_id
    and p.id = any (coalesce(p_project_ids, '{}'::uuid[]))
  on conflict do nothing;
end;
$$;

grant execute on function public.set_project_access(uuid, uuid, uuid[]) to authenticated;
