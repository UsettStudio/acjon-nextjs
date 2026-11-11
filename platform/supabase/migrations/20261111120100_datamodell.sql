-- =============================================================================
-- 0002 Datamodell
-- =============================================================================
--
-- Konsistens mellom organisasjoner (tenant-isolasjon i selve datamodellen):
--   Rader som hører til et prosjekt bærer både project_id og organization_id.
--   Alle referanser mellom slike rader er sammensatte fremmednøkler som også
--   inneholder project_id og organization_id, for eksempel
--     (target_unit_id, project_id, organization_id) -> units (id, project_id, organization_id).
--   Dermed kan en rad aldri peke til data i et annet prosjekt eller en annen
--   organisasjon, uansett hva klienten sender inn. RLS kommer i tillegg.
--
-- Valgfrie referanser bruker ON DELETE SET NULL (kolonne), slik at bare
-- referansekolonnen nullstilles og organization_id/project_id blir stående.
--
-- Alle fremmednøkler har en indeks som starter med nøkkelkolonnene
-- (kontrolleres automatisk i supabase/tests/00_skjema.test.sql).
--
-- Beløp lagres i hele kroner (bigint). Arealer i m² med én desimal.

-- -----------------------------------------------------------------------------
-- Organisasjoner og brukere
-- -----------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  -- Lik id. Gjør at også denne tabellen har organization_id, som alle andre.
  organization_id uuid generated always as (id) stored,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 63),
  logo_asset_id uuid,
  -- Merkevareprofil: farger, fonter og knappestil. Gjenbrukes på nye prosjektsider.
  brand jsonb not null default '{}'::jsonb check (jsonb_typeof(brand) = 'object'),
  -- Overstyring av standard statusfarger, f.eks. {"available": "#2E9E5B"}.
  status_colors jsonb not null default '{}'::jsonb check (jsonb_typeof(status_colors) = 'object'),
  locale text not null default 'nb' check (locale in ('nb', 'en', 'sv')),
  -- Lagringstid for leads i dager. null = lagres til de slettes manuelt.
  lead_retention_days integer check (lead_retention_days between 30 and 3650),
  -- Abonnement. Disse feltene oppdateres bare av Stripe-webhooken (service-rollen).
  plan text not null default 'trial' check (plan ~ '^[a-z0-9_]+$'),
  subscription_status public.subscription_status not null default 'trialing',
  trial_ends_at timestamptz default (now() + interval '30 days'),
  current_period_end timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.organizations is 'Kunden (boligutbygger eller meglerforetak). Rot for all tenant-data.';

-- Brukerprofil. Knyttet til brukeren, ikke til en organisasjon.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text check (char_length(full_name) <= 200),
  phone text check (char_length(phone) <= 40),
  avatar_url text check (char_length(avatar_url) <= 2048),
  locale text not null default 'nb' check (locale in ('nb', 'en', 'sv')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Navn og kontaktinfo for innloggede brukere. Opprettes automatisk fra auth.users.';

-- Intern superbruker for support. Gir lesetilgang på tvers av organisasjoner (ikke leads).
create table public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index memberships_user_id_idx on public.memberships (user_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null check (
    email = lower(btrim(email))
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(email) <= 320
  ),
  role public.member_role not null,
  -- Prosjekter en redaktør eller megler skal få tilgang til.
  project_ids uuid[] not null default '{}',
  -- SHA-256 av tokenet i invitasjonslenken. Selve tokenet lagres aldri.
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  invited_by uuid default auth.uid() references auth.users (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invitations_organization_id_idx on public.invitations (organization_id);
create unique index invitations_pending_email_key on public.invitations (organization_id, email)
  where accepted_at is null and revoked_at is null;
create index invitations_invited_by_idx on public.invitations (invited_by) where invited_by is not null;
create index invitations_accepted_by_idx on public.invitations (accepted_by) where accepted_by is not null;

-- -----------------------------------------------------------------------------
-- Prosjekter
-- -----------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  phase public.project_phase not null default 'draft',
  address text check (char_length(address) <= 300),
  postal_code text check (postal_code ~ '^[0-9]{4}$'),
  city text check (char_length(city) <= 100),
  municipality text check (char_length(municipality) <= 100),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  description text check (char_length(description) <= 20000),
  -- [{ "key": "planning" | "sales_start" | "construction_start" | "move_in" | <egen>,
  --    "label": "...", "text": "Høsten 2027", "date": "2027-09-01" }]
  milestones jsonb not null default '[]'::jsonb check (jsonb_typeof(milestones) = 'array'),
  -- [{ "name", "title", "email", "phone", "image_asset_id", "user_id", "receives_leads" }]
  contacts jsonb not null default '[]'::jsonb check (jsonb_typeof(contacts) = 'array'),
  -- { "ga4": "G-...", "gtm": "GTM-...", "meta_pixel": "..." } – lastes først etter samtykke.
  analytics_ids jsonb not null default '{}'::jsonb check (jsonb_typeof(analytics_ids) = 'object'),
  -- { "show_price_on_sold": false, "status_colors": {...}, "public_custom_fields": [...] }
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug),
  unique (id, organization_id),
  check ((lat is null) = (lng is null))
);

-- Avgrenser redaktører og meglere til tildelte prosjekter.
create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- project_id bestemmer organization_id, så dette er det samme som unique (project_id, user_id).
  unique (project_id, organization_id, user_id),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade,
  -- Bare medlemmer av organisasjonen kan få prosjekttilgang. Fjernes sammen med medlemskapet.
  foreign key (organization_id, user_id)
    references public.memberships (organization_id, user_id) on delete cascade
);
create index project_members_org_user_idx on public.project_members (organization_id, user_id);
create index project_members_user_id_idx on public.project_members (user_id);

-- -----------------------------------------------------------------------------
-- Mediebibliotek
-- -----------------------------------------------------------------------------

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- Valgfritt: hvilket prosjekt filen ble lastet opp til. Filen blir værende i
  -- organisasjonens bibliotek hvis prosjektet slettes.
  project_id uuid,
  bucket text not null default 'media' check (bucket = 'media'),
  -- Sti i bucketen: {organization_id}/{asset_id}/original.{ext}
  storage_path text not null unique check (char_length(storage_path) <= 1024),
  mime text not null check (mime in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  width integer check (width > 0),
  height integer check (height > 0),
  bytes bigint not null check (bytes > 0),
  alt_text text check (char_length(alt_text) <= 500),
  folder text not null default '' check (char_length(folder) <= 200),
  filename text check (char_length(filename) <= 255),
  -- WebP-varianter: [{ "width": 800, "height": 533, "path": "...", "bytes": 81234 }, ...]
  variants jsonb not null default '[]'::jsonb check (jsonb_typeof(variants) = 'array'),
  processing_status text not null default 'ready' check (processing_status in ('pending', 'ready', 'failed')),
  uploaded_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete set null (project_id),
  -- Filen må ligge i organisasjonens egen mappe i Storage.
  check (storage_path like organization_id::text || '/%'),
  -- Bilder inntil 25 MB, dokumenter inntil 50 MB.
  check (bytes <= case when mime like 'image/%' then 26214400 else 52428800 end),
  check ((width is null) = (height is null))
);
create index assets_organization_folder_idx on public.assets (organization_id, folder);
create index assets_project_idx on public.assets (project_id, organization_id) where project_id is not null;
create index assets_uploaded_by_idx on public.assets (uploaded_by) where uploaded_by is not null;

alter table public.organizations
  add constraint organizations_logo_asset_id_fkey
  foreign key (logo_asset_id) references public.assets (id) on delete set null;
create index organizations_logo_asset_id_idx on public.organizations (logo_asset_id)
  where logo_asset_id is not null;

-- -----------------------------------------------------------------------------
-- Byggetrinn, bygg og enheter
-- -----------------------------------------------------------------------------

create table public.stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  sort_order integer not null default 0,
  phase public.project_phase not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, project_id, organization_id),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade
);
create index stages_project_idx on public.stages (project_id, organization_id, sort_order);

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  stage_id uuid,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, project_id, organization_id),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade,
  foreign key (stage_id, project_id, organization_id)
    references public.stages (id, project_id, organization_id) on delete set null (stage_id)
);
create index buildings_project_idx on public.buildings (project_id, organization_id, sort_order);
create index buildings_stage_idx on public.buildings (stage_id, project_id, organization_id)
  where stage_id is not null;

create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  stage_id uuid,
  building_id uuid,
  unit_number text not null check (unit_number = btrim(unit_number) and char_length(unit_number) between 1 and 40),
  -- Brukes i adressen /bolig/{slug}. Lages fra unit_number hvis den ikke oppgis.
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title text check (char_length(title) <= 200),
  unit_type public.unit_type not null default 'apartment',
  status public.unit_status not null default 'available',
  floor smallint check (floor between -10 and 200),
  rooms smallint check (rooms between 0 and 100),
  bedrooms smallint check (bedrooms between 0 and 100),
  bathrooms smallint check (bathrooms between 0 and 50),
  bra_i numeric(8, 1) check (bra_i >= 0),
  bra_e numeric(8, 1) check (bra_e >= 0),
  bra_b numeric(8, 1) check (bra_b >= 0),
  tba numeric(8, 1) check (tba >= 0),
  plot_area numeric(10, 1) check (plot_area >= 0),
  -- Totalpris = price + purchase_costs. Med fellesgjeld: + shared_debt (beregnes i appen).
  price bigint check (price >= 0),
  purchase_costs bigint check (purchase_costs >= 0),
  shared_debt bigint check (shared_debt >= 0),
  monthly_fee integer check (monthly_fee >= 0),
  ownership_type public.ownership_type,
  orientation text check (char_length(orientation) <= 100),
  parking text check (char_length(parking) <= 500),
  storage text check (char_length(storage) <= 500),
  description text check (char_length(description) <= 20000),
  -- Rekkefølgen i listene er visningsrekkefølgen. Valideres mot assets i trigger.
  floor_plan_asset_ids uuid[] not null default '{}',
  gallery_asset_ids uuid[] not null default '{}',
  document_asset_ids uuid[] not null default '{}',
  -- Egne felt. Bare nøkler listet i projects.settings.public_custom_fields blir offentlige.
  custom_fields jsonb not null default '{}'::jsonb check (jsonb_typeof(custom_fields) = 'object'),
  -- For senere synk mot meglersystemer og FINN.
  external_id text check (char_length(external_id) <= 200),
  source text not null default 'manual' check (source ~ '^[a-z0-9_]+$' and char_length(source) <= 40),
  sort_order integer not null default 0,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, unit_number),
  unique (project_id, slug),
  unique (id, project_id, organization_id),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade,
  foreign key (stage_id, project_id, organization_id)
    references public.stages (id, project_id, organization_id) on delete set null (stage_id),
  foreign key (building_id, project_id, organization_id)
    references public.buildings (id, project_id, organization_id) on delete set null (building_id),
  check (
    cardinality(floor_plan_asset_ids) <= 20
    and cardinality(gallery_asset_ids) <= 100
    and cardinality(document_asset_ids) <= 50
  )
);
create index units_project_idx on public.units (project_id, organization_id, sort_order);
create index units_stage_idx on public.units (stage_id, project_id, organization_id) where stage_id is not null;
create index units_building_idx on public.units (building_id, project_id, organization_id) where building_id is not null;
create unique index units_external_id_key on public.units (project_id, source, external_id)
  where external_id is not null;

-- Statuslogg. Fylles av trigger på units og kan aldri endres (se migrasjon 0005).
create table public.unit_status_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  -- Settes til null hvis enheten slettes. Historikken beholdes.
  unit_id uuid,
  unit_number text not null,
  from_status public.unit_status,
  to_status public.unit_status not null,
  changed_by uuid references auth.users (id) on delete set null,
  note text check (char_length(note) <= 1000),
  source text not null default 'admin'
    check (source in ('admin', 'table', 'form', 'selector', 'import', 'api', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade,
  foreign key (unit_id, project_id, organization_id)
    references public.units (id, project_id, organization_id) on delete set null (unit_id),
  check (from_status is distinct from to_status)
);
create index unit_status_events_project_idx on public.unit_status_events (project_id, organization_id, created_at desc);
create index unit_status_events_unit_idx on public.unit_status_events (unit_id, project_id, organization_id, created_at desc)
  where unit_id is not null;
create index unit_status_events_changed_by_idx on public.unit_status_events (changed_by) where changed_by is not null;

-- -----------------------------------------------------------------------------
-- Boligvelger
-- -----------------------------------------------------------------------------

create table public.selectors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  entry_view_id uuid,
  -- Filtre, kolonner, listeplassering og skravur. Valideres med Zod i appen.
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  -- Former og koblinger går ut ved publisering: publish_selector() lagrer et
  -- øyeblikksbilde av visninger og markeringer her. Status leses alltid live fra units.
  published_at timestamptz,
  published_snapshot jsonb check (published_snapshot is null or jsonb_typeof(published_snapshot) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, project_id, organization_id),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade,
  check ((published_at is null) = (published_snapshot is null))
);
create index selectors_project_idx on public.selectors (project_id, organization_id);

create table public.selector_views (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  selector_id uuid not null,
  parent_view_id uuid,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  kind public.selector_view_kind not null default 'facade',
  asset_id uuid,
  -- Originalbildets størrelse. Markeringene er andeler av denne.
  image_width integer check (image_width > 0),
  image_height integer check (image_height > 0),
  -- Visninger med samme angle_group under samme forelder kan kjøper bla mellom.
  angle_group text check (char_length(angle_group) <= 100),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, project_id, organization_id),
  foreign key (selector_id, project_id, organization_id)
    references public.selectors (id, project_id, organization_id) on delete cascade,
  foreign key (parent_view_id, project_id, organization_id)
    references public.selector_views (id, project_id, organization_id) on delete set null (parent_view_id),
  foreign key (asset_id, organization_id)
    references public.assets (id, organization_id) on delete set null (asset_id),
  check ((image_width is null) = (image_height is null)),
  check (parent_view_id is distinct from id)
);
create index selector_views_selector_idx on public.selector_views (selector_id, project_id, organization_id, sort_order);
create index selector_views_parent_idx on public.selector_views (parent_view_id, project_id, organization_id)
  where parent_view_id is not null;
create index selector_views_asset_idx on public.selector_views (asset_id, organization_id) where asset_id is not null;

alter table public.selectors
  add constraint selectors_entry_view_fkey
  foreign key (entry_view_id, project_id, organization_id)
  references public.selector_views (id, project_id, organization_id) on delete set null (entry_view_id);
create index selectors_entry_view_idx on public.selectors (entry_view_id, project_id, organization_id)
  where entry_view_id is not null;

-- Markeringer. Lagrer aldri status eller farge – status leses fra units.status.
create table public.hotspots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  view_id uuid not null,
  shape public.hotspot_shape not null default 'polygon',
  -- [[x, y], ...] som andeler fra 0 til 1 av bildets bredde og høyde.
  points jsonb not null,
  -- null = tegnet, men ikke koblet ennå.
  target_type public.hotspot_target_type,
  target_unit_id uuid,
  target_view_id uuid,
  target_project_id uuid,
  target_url text check (target_url ~ '^https?://' and char_length(target_url) <= 2048),
  label text check (char_length(label) <= 200),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (view_id, project_id, organization_id)
    references public.selector_views (id, project_id, organization_id) on delete cascade,
  -- Sletting av en enhet fjerner markeringene som peker på den.
  foreign key (target_unit_id, project_id, organization_id)
    references public.units (id, project_id, organization_id) on delete cascade,
  foreign key (target_view_id, project_id, organization_id)
    references public.selector_views (id, project_id, organization_id) on delete set null (target_view_id),
  foreign key (target_project_id, organization_id)
    references public.projects (id, organization_id) on delete set null (target_project_id),
  check (app.valid_hotspot_points(shape, points)),
  check (target_unit_id is null or target_type = 'unit'),
  check (target_view_id is null or target_type = 'view'),
  check (target_project_id is null or target_type = 'project'),
  check (target_url is null or target_type = 'url'),
  check (target_type is distinct from 'unit' or target_unit_id is not null),
  check (target_type is distinct from 'url' or target_url is not null)
);
create index hotspots_view_idx on public.hotspots (view_id, project_id, organization_id, sort_order);
create index hotspots_target_unit_idx on public.hotspots (target_unit_id, project_id, organization_id)
  where target_unit_id is not null;
create index hotspots_target_view_idx on public.hotspots (target_view_id, project_id, organization_id)
  where target_view_id is not null;
create index hotspots_target_project_idx on public.hotspots (target_project_id, organization_id)
  where target_project_id is not null;

-- -----------------------------------------------------------------------------
-- Prosjektsider
-- -----------------------------------------------------------------------------

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  -- {subdomain}.[PLATTFORMDOMENE]
  subdomain text not null unique check (
    subdomain ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$' and not app.is_reserved_subdomain(subdomain)
  ),
  -- Utkast. Tema overstyrer organisasjonens merkevareprofil.
  theme jsonb not null default '{}'::jsonb check (jsonb_typeof(theme) = 'object'),
  nav jsonb not null default '[]'::jsonb check (jsonb_typeof(nav) = 'array'),
  footer jsonb not null default '{}'::jsonb check (jsonb_typeof(footer) = 'object'),
  seo_defaults jsonb not null default '{}'::jsonb check (jsonb_typeof(seo_defaults) = 'object'),
  cookie_settings jsonb not null default '{}'::jsonb check (jsonb_typeof(cookie_settings) = 'object'),
  -- Publisert utgave av feltene over, pluss home_page_id. Settes av publish_site().
  published_config jsonb check (published_config is null or jsonb_typeof(published_config) = 'object'),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Én prosjektside per prosjekt (project_id bestemmer organization_id).
  unique (project_id, organization_id),
  unique (id, project_id, organization_id),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade,
  check ((published_at is null) = (published_config is null))
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  site_id uuid not null,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  slug text not null check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80 and not app.is_reserved_page_slug(slug)
  ),
  is_home boolean not null default false,
  sort_order integer not null default 0,
  seo_title text check (char_length(seo_title) <= 200),
  seo_description text check (char_length(seo_description) <= 500),
  og_asset_id uuid,
  -- Utkast og publisert er adskilt. Blokker: [{ "id", "type", "hidden", "props": {...} }]
  draft_blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(draft_blocks) = 'array'),
  published_blocks jsonb check (published_blocks is null or jsonb_typeof(published_blocks) = 'array'),
  published_slug text,
  -- Publisert tittel og SEO: { "title", "seo_title", "seo_description", "og_asset_id" }
  published_meta jsonb check (published_meta is null or jsonb_typeof(published_meta) = 'object'),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug),
  -- Utsatt kontroll, slik at publisering kan bytte adresse på to sider i samme transaksjon.
  constraint pages_published_slug_key unique (site_id, published_slug) deferrable initially deferred,
  unique (id, project_id, organization_id),
  foreign key (site_id, project_id, organization_id)
    references public.sites (id, project_id, organization_id) on delete cascade,
  foreign key (og_asset_id, organization_id)
    references public.assets (id, organization_id) on delete set null (og_asset_id),
  check (
    (published_at is null) = (published_blocks is null)
    and (published_at is null) = (published_slug is null)
    and (published_at is null) = (published_meta is null)
  )
);
create unique index pages_one_home_per_site on public.pages (site_id) where is_home;
create index pages_site_idx on public.pages (site_id, project_id, organization_id, sort_order);
create index pages_og_asset_idx on public.pages (og_asset_id, organization_id) where og_asset_id is not null;

-- Versjonshistorikk. En ny versjon lagres hver gang en endret side publiseres.
create table public.page_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  page_id uuid not null,
  version integer not null check (version > 0),
  blocks jsonb not null check (jsonb_typeof(blocks) = 'array'),
  meta jsonb not null default '{}'::jsonb check (jsonb_typeof(meta) = 'object'),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, version),
  foreign key (page_id, project_id, organization_id)
    references public.pages (id, project_id, organization_id) on delete cascade
);
create index page_versions_page_idx on public.page_versions (page_id, project_id, organization_id);
create index page_versions_created_by_idx on public.page_versions (created_by) where created_by is not null;

-- Egne domener. Bekreftes ved at DNS peker til plattformen og TXT-posten inneholder
-- verification_token. Bare bekreftede domener brukes i ruting og må være unike;
-- ubekreftede krav kan ikke blokkere den reelle eieren av domenet.
create table public.domains (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  site_id uuid not null,
  hostname text not null check (
    hostname = lower(hostname)
    and char_length(hostname) <= 253
    and hostname ~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,61}[a-z0-9]$'
  ),
  is_primary boolean not null default false,
  verification_token text not null default replace(gen_random_uuid()::text, '-', ''),
  status text not null default 'pending' check (status in ('pending', 'verified', 'misconfigured', 'error')),
  -- DNS-poster kunden må sette, slik Vercel oppgir dem.
  dns_records jsonb not null default '[]'::jsonb check (jsonb_typeof(dns_records) = 'array'),
  verified_at timestamptz,
  last_checked_at timestamptz,
  last_error text check (char_length(last_error) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, hostname),
  foreign key (site_id, project_id, organization_id)
    references public.sites (id, project_id, organization_id) on delete cascade,
  check ((status = 'verified') = (verified_at is not null))
);
create unique index domains_verified_hostname_key on public.domains (hostname) where verified_at is not null;
create unique index domains_one_primary_per_site on public.domains (site_id) where is_primary;
create index domains_site_idx on public.domains (site_id, project_id, organization_id);

-- -----------------------------------------------------------------------------
-- Leads
-- -----------------------------------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  unit_id uuid,
  page_id uuid,
  -- Øyeblikksbilde, så leadet viser riktig enhet også om enheten slettes.
  unit_number text,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 320),
  phone text check (char_length(phone) <= 40),
  message text check (char_length(message) <= 5000),
  -- Samtykke lagres med tidspunkt og tekstversjon.
  consent_contact boolean not null check (consent_contact),
  consent_similar_projects boolean not null default false,
  consent_text_version text not null check (char_length(consent_text_version) between 1 and 100),
  consented_at timestamptz not null default now(),
  source text not null default 'site'
    check (source in ('site', 'selector', 'unit_page', 'embed', 'api', 'manual')),
  utm jsonb not null default '{}'::jsonb check (jsonb_typeof(utm) = 'object'),
  status public.lead_status not null default 'new',
  internal_note text check (char_length(internal_note) <= 5000),
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade,
  foreign key (unit_id, project_id, organization_id)
    references public.units (id, project_id, organization_id) on delete set null (unit_id),
  foreign key (page_id, project_id, organization_id)
    references public.pages (id, project_id, organization_id) on delete set null (page_id)
);
create index leads_project_idx on public.leads (project_id, organization_id, created_at desc);
create index leads_organization_idx on public.leads (organization_id, created_at desc);
create index leads_email_idx on public.leads (organization_id, lower(email));
create index leads_unit_idx on public.leads (unit_id, project_id, organization_id) where unit_id is not null;
create index leads_page_idx on public.leads (page_id, project_id, organization_id) where page_id is not null;

-- -----------------------------------------------------------------------------
-- Integrasjoner
-- -----------------------------------------------------------------------------

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  -- Vises i admin for å kjenne igjen nøkkelen. Selve nøkkelen vises bare én gang.
  key_prefix text not null check (char_length(key_prefix) between 8 and 16),
  key_hash text not null unique check (key_hash ~ '^[0-9a-f]{64}$'),
  scopes text[] not null default '{units:read}'
    check (scopes <@ array['units:read', 'units:write', 'projects:read', 'leads:read']),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index api_keys_organization_idx on public.api_keys (organization_id);
create index api_keys_created_by_idx on public.api_keys (created_by) where created_by is not null;

create table public.webhooks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  url text not null check (url ~ '^https://' and char_length(url) <= 2048),
  description text check (char_length(description) <= 500),
  events text[] not null
    check (cardinality(events) > 0 and events <@ array['unit.status_changed', 'lead.created']),
  -- null = alle prosjekter i organisasjonen.
  project_ids uuid[],
  -- Brukes til HMAC-signatur av hver levering, slik at mottakeren kan verifisere avsender.
  secret text not null check (char_length(secret) >= 32),
  is_active boolean not null default true,
  failure_count integer not null default 0,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id)
);
create index webhooks_organization_idx on public.webhooks (organization_id);
create index webhooks_created_by_idx on public.webhooks (created_by) where created_by is not null;

-- Utboks for webhooks. Rader legges inn i samme transaksjon som hendelsen og
-- sendes av en jobb med nye forsøk ved feil.
create table public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  webhook_id uuid not null,
  event text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_response_status integer,
  last_error text check (char_length(last_error) <= 2000),
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (webhook_id, organization_id)
    references public.webhooks (id, organization_id) on delete cascade
);
create index webhook_deliveries_webhook_idx on public.webhook_deliveries (webhook_id, organization_id, created_at desc);
create index webhook_deliveries_pending_idx on public.webhook_deliveries (next_attempt_at) where status = 'pending';

-- Revisjonslogg for pålogging, statusendringer, publisering og brukerendringer.
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid,
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  actor_type text not null check (actor_type in ('user', 'platform_admin', 'api_key', 'system')),
  action text not null check (action ~ '^[a-z_]+(\.[a-z_]+)+$'),
  entity_type text,
  entity_id uuid,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete set null (project_id)
);
create index audit_log_organization_idx on public.audit_log (organization_id, created_at desc);
create index audit_log_project_idx on public.audit_log (project_id, organization_id, created_at desc)
  where project_id is not null;
create index audit_log_actor_idx on public.audit_log (actor_id) where actor_id is not null;

-- Rate limiting for interesseskjema. Nøkkelen er en hash (aldri rå IP-adresse).
create table public.rate_limit_buckets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  key text not null check (char_length(key) <= 200),
  window_start timestamptz not null,
  hits integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, key, window_start)
);
create index rate_limit_buckets_window_idx on public.rate_limit_buckets (window_start);
