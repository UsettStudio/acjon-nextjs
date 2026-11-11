-- =============================================================================
-- 0004 Radnivåsikkerhet (RLS) og tabellrettigheter
-- =============================================================================
--
-- Hele sikkerhetsmodellen for tabellene står i denne filen.
--
--   * RLS er på for alle tabeller. Uten en policy som slipper raden gjennom,
--     ser eller endrer ingen innlogget bruker den.
--   * anon har ingen tabellrettigheter i det hele tatt.
--   * Kolonnerettigheter hindrer at klienter setter systemfelt direkte:
--     abonnement, publisert innhold, domenebekreftelse, samtykke og logger.
--     Slike felt endres bare av funksjonene i migrasjon 0005 (*_domenelogikk.sql) eller av service-rollen.
--   * Skrivepolicyer krever skrivbar organisasjon (lesemodus ved utløpt abonnement).
--     Unntak: å forlate en organisasjon og å slette leads (GDPR) er alltid lov.
--   * Plattformadmin har lesetilgang for support, men ser ikke leads,
--     API-nøkler, webhook-hemmeligheter eller webhook-leveranser.

-- -----------------------------------------------------------------------------
-- Tabellrettigheter
-- -----------------------------------------------------------------------------

revoke all on all tables in schema public from anon;
revoke truncate, references, trigger on all tables in schema public from authenticated;

-- Tabeller som bare skrives av triggere, funksjoner eller service-rollen.
revoke insert, update, delete on
  public.platform_admins,
  public.unit_status_events,
  public.page_versions,
  public.webhook_deliveries,
  public.audit_log
from authenticated;
revoke all on public.rate_limit_buckets from authenticated;

-- organizations: opprettes med create_organization(). Abonnementsfelt endres bare av Stripe-webhooken.
revoke insert, update, delete on public.organizations from authenticated;
grant update (name, slug, logo_asset_id, brand, status_colors, locale, lead_retention_days)
  on public.organizations to authenticated;

-- profiles: opprettes fra auth.users. E-post synkroniseres derfra.
revoke insert, update, delete on public.profiles from authenticated;
grant update (full_name, phone, avatar_url, locale) on public.profiles to authenticated;

-- memberships: opprettes med create_organization() og accept_invitation(). Bare rollen kan endres.
revoke insert, update on public.memberships from authenticated;
grant update (role) on public.memberships to authenticated;

-- invitations: accepted_* settes av accept_invitation(). invited_by settes automatisk.
revoke insert, update on public.invitations from authenticated;
grant insert (id, organization_id, email, role, project_ids, token_hash, expires_at)
  on public.invitations to authenticated;
grant update (role, project_ids, token_hash, expires_at, revoked_at)
  on public.invitations to authenticated;

revoke update on public.project_members from authenticated;

-- assets: uploaded_by settes automatisk. Sti, filtype og størrelse kan ikke endres.
revoke insert, update on public.assets from authenticated;
grant insert (id, organization_id, project_id, bucket, storage_path, mime, width, height, bytes,
              alt_text, folder, filename, variants, processing_status)
  on public.assets to authenticated;
grant update (project_id, alt_text, folder, filename, width, height, variants, processing_status)
  on public.assets to authenticated;

-- Publisert innhold settes bare av publiseringsfunksjonene.
revoke insert, update on public.selectors from authenticated;
grant insert (id, organization_id, project_id, name, entry_view_id, settings) on public.selectors to authenticated;
grant update (name, entry_view_id, settings) on public.selectors to authenticated;

revoke insert, update on public.sites from authenticated;
grant insert (id, organization_id, project_id, subdomain, theme, nav, footer, seo_defaults, cookie_settings)
  on public.sites to authenticated;
grant update (subdomain, theme, nav, footer, seo_defaults, cookie_settings) on public.sites to authenticated;

revoke insert, update on public.pages from authenticated;
grant insert (id, organization_id, project_id, site_id, title, slug, is_home, sort_order,
              seo_title, seo_description, og_asset_id, draft_blocks)
  on public.pages to authenticated;
grant update (title, slug, is_home, sort_order, seo_title, seo_description, og_asset_id, draft_blocks)
  on public.pages to authenticated;

-- domains: bekreftelse og DNS-status settes av serveren etter sjekk mot Vercel og DNS.
revoke insert, update on public.domains from authenticated;
grant insert (id, organization_id, project_id, site_id, hostname, is_primary) on public.domains to authenticated;
grant update (is_primary) on public.domains to authenticated;

-- leads: legges inn av serveren etter Turnstile, honeypot og rate limit.
-- Samtykke og opprinnelse kan ikke endres i etterkant.
revoke insert, update on public.leads from authenticated;
grant update (status, internal_note, name, email, phone) on public.leads to authenticated;

revoke insert, update on public.api_keys from authenticated;
grant insert (id, organization_id, name, key_prefix, key_hash, scopes, expires_at) on public.api_keys to authenticated;
grant update (name, scopes, expires_at, revoked_at) on public.api_keys to authenticated;

revoke insert, update on public.webhooks from authenticated;
grant insert (id, organization_id, url, description, events, project_ids, secret, is_active)
  on public.webhooks to authenticated;
grant update (url, description, events, project_ids, secret, is_active) on public.webhooks to authenticated;

-- -----------------------------------------------------------------------------
-- Slå på RLS for alle tabeller
-- -----------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.platform_admins enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.assets enable row level security;
alter table public.stages enable row level security;
alter table public.buildings enable row level security;
alter table public.units enable row level security;
alter table public.unit_status_events enable row level security;
alter table public.selectors enable row level security;
alter table public.selector_views enable row level security;
alter table public.hotspots enable row level security;
alter table public.sites enable row level security;
alter table public.pages enable row level security;
alter table public.page_versions enable row level security;
alter table public.domains enable row level security;
alter table public.leads enable row level security;
alter table public.api_keys enable row level security;
alter table public.webhooks enable row level security;
alter table public.webhook_deliveries enable row level security;
alter table public.audit_log enable row level security;
alter table public.rate_limit_buckets enable row level security;  -- ingen policyer: bare service-rollen

-- -----------------------------------------------------------------------------
-- Organisasjon og brukere
-- -----------------------------------------------------------------------------

create policy "organizations: medlemmer leser" on public.organizations
  for select to authenticated
  using (id in (select app.org_ids_with_role()) or (select app.is_platform_admin()));

create policy "organizations: eier og admin endrer" on public.organizations
  for update to authenticated
  using (id in (select app.org_ids_with_role(app.roles_admin(), true)))
  with check (id in (select app.org_ids_with_role(app.roles_admin(), true)));

create policy "profiles: egen og kolleger leses" on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or id in (select app.visible_user_ids())
    or (select app.is_platform_admin())
  );

create policy "profiles: egen profil endres" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "platform_admins: se egen rad" on public.platform_admins
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "memberships: medlemmer leser" on public.memberships
  for select to authenticated
  using (organization_id in (select app.org_ids_with_role()) or (select app.is_platform_admin()));

-- Eier kan gi alle roller. Administrator kan ikke røre eiere eller gjøre noen til eier.
create policy "memberships: eier og admin endrer rolle" on public.memberships
  for update to authenticated
  using (
    organization_id in (select app.org_ids_with_role(array['owner']::public.member_role[], true))
    or (role <> 'owner' and organization_id in (select app.org_ids_with_role(array['admin']::public.member_role[], true)))
  )
  with check (
    organization_id in (select app.org_ids_with_role(array['owner']::public.member_role[], true))
    or (role <> 'owner' and organization_id in (select app.org_ids_with_role(array['admin']::public.member_role[], true)))
  );

-- Alle kan forlate en organisasjon. Siste eier stoppes av en trigger i migrasjon 0005.
create policy "memberships: fjerne medlem eller forlate" on public.memberships
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    or organization_id in (select app.org_ids_with_role(array['owner']::public.member_role[], true))
    or (role <> 'owner' and organization_id in (select app.org_ids_with_role(array['admin']::public.member_role[], true)))
  );

create policy "invitations: eier og admin leser" on public.invitations
  for select to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin())) or (select app.is_platform_admin()));

create policy "invitations: eier og admin inviterer" on public.invitations
  for insert to authenticated
  with check (
    organization_id in (select app.org_ids_with_role(app.roles_admin(), true))
    and (role <> 'owner' or organization_id in (select app.org_ids_with_role(array['owner']::public.member_role[], true)))
  );

create policy "invitations: eier og admin endrer" on public.invitations
  for update to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)))
  with check (
    organization_id in (select app.org_ids_with_role(app.roles_admin(), true))
    and (role <> 'owner' or organization_id in (select app.org_ids_with_role(array['owner']::public.member_role[], true)))
  );

create policy "invitations: eier og admin sletter" on public.invitations
  for delete to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));

-- -----------------------------------------------------------------------------
-- Prosjekter
-- -----------------------------------------------------------------------------

create policy "projects: lese tilgjengelige" on public.projects
  for select to authenticated
  using (id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));

create policy "projects: eier og admin oppretter" on public.projects
  for insert to authenticated
  with check (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));

create policy "projects: innholdsroller endrer" on public.projects
  for update to authenticated
  using (id in (select app.project_ids_with_role(app.roles_content(), true)))
  with check (id in (select app.project_ids_with_role(app.roles_content(), true)));

create policy "projects: eier og admin sletter" on public.projects
  for delete to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));

create policy "project_members: lese i tilgjengelige prosjekter" on public.project_members
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));

create policy "project_members: eier og admin tildeler" on public.project_members
  for insert to authenticated
  with check (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));

create policy "project_members: eier og admin fjerner" on public.project_members
  for delete to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));

-- -----------------------------------------------------------------------------
-- Mediebibliotek
-- -----------------------------------------------------------------------------

-- Alle medlemmer ser organisasjonens bibliotek (meglere trenger plantegninger).
create policy "assets: medlemmer leser" on public.assets
  for select to authenticated
  using (organization_id in (select app.org_ids_with_role()) or (select app.is_platform_admin()));

create policy "assets: innholdsroller laster opp" on public.assets
  for insert to authenticated
  with check (
    organization_id in (select app.org_ids_with_role(app.roles_content(), true))
    and (project_id is null or project_id in (select app.project_ids_with_role(app.roles_content(), true)))
  );

create policy "assets: innholdsroller endrer" on public.assets
  for update to authenticated
  using (
    (project_id is null and organization_id in (select app.org_ids_with_role(app.roles_content(), true)))
    or project_id in (select app.project_ids_with_role(app.roles_content(), true))
  )
  with check (
    (project_id is null and organization_id in (select app.org_ids_with_role(app.roles_content(), true)))
    or project_id in (select app.project_ids_with_role(app.roles_content(), true))
  );

-- Eier og admin sletter alt. Redaktører kan slette egne opplastinger.
create policy "assets: eier, admin eller opplaster sletter" on public.assets
  for delete to authenticated
  using (
    organization_id in (select app.org_ids_with_role(app.roles_admin(), true))
    or (
      uploaded_by = (select auth.uid())
      and organization_id in (select app.org_ids_with_role(app.roles_content(), true))
    )
  );

-- -----------------------------------------------------------------------------
-- Prosjektinnhold: byggetrinn, bygg, enheter, boligvelger og prosjektsider
-- Lesing: alle med tilgang til prosjektet. Skriving: eier, admin og tildelt redaktør.
-- -----------------------------------------------------------------------------

create policy "stages: lese" on public.stages
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));
create policy "stages: opprette" on public.stages
  for insert to authenticated
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "stages: endre" on public.stages
  for update to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)))
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "stages: slette" on public.stages
  for delete to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)));

create policy "buildings: lese" on public.buildings
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));
create policy "buildings: opprette" on public.buildings
  for insert to authenticated
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "buildings: endre" on public.buildings
  for update to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)))
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "buildings: slette" on public.buildings
  for delete to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)));

create policy "units: lese" on public.units
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));
create policy "units: opprette" on public.units
  for insert to authenticated
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
-- Meglere slipper gjennom her, men en trigger i migrasjon 0005 begrenser dem til status og pris.
create policy "units: endre" on public.units
  for update to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_sales(), true)))
  with check (project_id in (select app.project_ids_with_role(app.roles_sales(), true)));
create policy "units: slette" on public.units
  for delete to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)));

create policy "unit_status_events: lese" on public.unit_status_events
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));

create policy "selectors: lese" on public.selectors
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));
create policy "selectors: opprette" on public.selectors
  for insert to authenticated
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "selectors: endre" on public.selectors
  for update to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)))
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "selectors: slette" on public.selectors
  for delete to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)));

create policy "selector_views: lese" on public.selector_views
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));
create policy "selector_views: opprette" on public.selector_views
  for insert to authenticated
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "selector_views: endre" on public.selector_views
  for update to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)))
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "selector_views: slette" on public.selector_views
  for delete to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)));

create policy "hotspots: lese" on public.hotspots
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));
create policy "hotspots: opprette" on public.hotspots
  for insert to authenticated
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "hotspots: endre" on public.hotspots
  for update to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)))
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "hotspots: slette" on public.hotspots
  for delete to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)));

create policy "sites: lese" on public.sites
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));
create policy "sites: opprette" on public.sites
  for insert to authenticated
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "sites: endre" on public.sites
  for update to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)))
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "sites: slette" on public.sites
  for delete to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)));

create policy "pages: lese" on public.pages
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));
create policy "pages: opprette" on public.pages
  for insert to authenticated
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "pages: endre" on public.pages
  for update to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)))
  with check (project_id in (select app.project_ids_with_role(app.roles_content(), true)));
create policy "pages: slette" on public.pages
  for delete to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_content(), true)));

create policy "page_versions: lese" on public.page_versions
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));

-- Domener administreres under Innstillinger av eier og admin. Alle med prosjekttilgang kan se dem.
create policy "domains: lese" on public.domains
  for select to authenticated
  using (project_id in (select app.project_ids_with_role()) or (select app.is_platform_admin()));
create policy "domains: eier og admin legger til" on public.domains
  for insert to authenticated
  with check (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));
create policy "domains: eier og admin endrer" on public.domains
  for update to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)))
  with check (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));
create policy "domains: eier og admin fjerner" on public.domains
  for delete to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));

-- -----------------------------------------------------------------------------
-- Leads: eier, admin og tildelt megler. Ikke redaktør, ikke plattformadmin.
-- -----------------------------------------------------------------------------

create policy "leads: lese" on public.leads
  for select to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_leads())));

create policy "leads: behandle" on public.leads
  for update to authenticated
  using (project_id in (select app.project_ids_with_role(app.roles_leads(), true)))
  with check (project_id in (select app.project_ids_with_role(app.roles_leads(), true)));

-- Sletting (GDPR) er lov også i lesemodus.
create policy "leads: eier og admin sletter" on public.leads
  for delete to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin())));

-- -----------------------------------------------------------------------------
-- Integrasjoner og logger: eier og admin
-- -----------------------------------------------------------------------------

create policy "api_keys: lese" on public.api_keys
  for select to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin())));
create policy "api_keys: opprette" on public.api_keys
  for insert to authenticated
  with check (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));
create policy "api_keys: endre" on public.api_keys
  for update to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)))
  with check (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));
create policy "api_keys: slette" on public.api_keys
  for delete to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));

create policy "webhooks: lese" on public.webhooks
  for select to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin())));
create policy "webhooks: opprette" on public.webhooks
  for insert to authenticated
  with check (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));
create policy "webhooks: endre" on public.webhooks
  for update to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)))
  with check (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));
create policy "webhooks: slette" on public.webhooks
  for delete to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin(), true)));

create policy "webhook_deliveries: lese" on public.webhook_deliveries
  for select to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin())));

create policy "audit_log: lese" on public.audit_log
  for select to authenticated
  using (organization_id in (select app.org_ids_with_role(app.roles_admin())) or (select app.is_platform_admin()));
