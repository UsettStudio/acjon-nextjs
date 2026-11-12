import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";

import { ASSET_COLUMNS, toMediaAsset } from "@/features/media/assets";
import {
  isPriceHidden,
  parsePublicUnitDetail,
  parsePublicUnits,
  parsePublishedSelector,
  publicAssetSchema,
  resolveStatusColors,
  type PublicUnit,
  type PublishedSelector,
} from "@/features/selector/model";
import { fromMediaAsset, fromPublicAsset, type SiteAsset } from "@/features/site-builder/assets";
import { blockAssetIds, parseBlocks, type Block } from "@/features/site-builder/blocks";
import {
  parseFooter,
  parseNav,
  parsePublishedPage,
  parseResolvedSite,
  parseSeoDefaults,
  siteUrl,
  themeLogoId,
  type ResolvedSite,
  type SiteContact,
  type SiteProject,
  type SiteRenderData,
} from "@/features/site-builder/site";
import type { DraftPage, DraftSite } from "@/features/site-builder/draft";
import { resolveTheme } from "@/features/site-builder/theme";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

/** Mellomlagring av publiserte prosjektsider. Tømmes med tagger ved publisering og statusendring. */
const PUBLISHED_CACHE = { stale: 60, revalidate: 300, expire: 3600 } as const;

export const siteTags = {
  key: (key: string) => `site-key:${key}`,
  site: (siteId: string) => `site:${siteId}`,
  project: (projectId: string) => `project:${projectId}`,
  units: (projectId: string) => `project:${projectId}:units`,
  selector: (selectorId: string) => `selector:${selectorId}`,
};

/** Anonym klient uten cookies. Brukes inne i mellomlagrede funksjoner (ingen forespørselsdata). */
function anonClient(): Client {
  const env = publicEnv();
  return createSupabaseClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

// -----------------------------------------------------------------------------
// Publisert prosjektside
// -----------------------------------------------------------------------------

/** Publisert prosjektside fra underdomene eller eget domene (nøkkelen inneholder da punktum). */
export async function getPublishedSite(key: string): Promise<ResolvedSite | null> {
  "use cache";
  cacheLife(PUBLISHED_CACHE);
  cacheTag(siteTags.key(key));
  const isHostname = key.includes(".");
  const { data, error } = await anonClient().rpc(
    "resolve_site",
    isHostname ? { p_hostname: key.toLowerCase() } : { p_subdomain: key.toLowerCase() },
  );
  if (error) {
    throw error;
  }
  const site = parseResolvedSite(data);
  if (site) {
    cacheTag(siteTags.site(site.id), siteTags.project(site.project.id));
  }
  return site;
}

export async function getPublishedPage(siteId: string, slug: string | null): Promise<SiteRenderData["page"]> {
  "use cache";
  cacheLife(PUBLISHED_CACHE);
  cacheTag(siteTags.site(siteId));
  const { data, error } = await anonClient().rpc("get_published_page", { p_site_id: siteId, p_slug: slug ?? undefined });
  if (error) {
    throw error;
  }
  return parsePublishedPage(data);
}

async function getPublishedAssets(siteId: string, ids: string[]): Promise<Record<string, SiteAsset>> {
  "use cache";
  cacheLife(PUBLISHED_CACHE);
  cacheTag(siteTags.site(siteId));
  if (ids.length === 0) {
    return {};
  }
  const { data, error } = await anonClient().rpc("get_public_assets", { p_site_id: siteId, p_asset_ids: ids });
  if (error) {
    throw error;
  }
  const result: Record<string, SiteAsset> = {};
  for (const item of Array.isArray(data) ? data : []) {
    const parsed = publicAssetSchema.safeParse(item);
    if (parsed.success) {
      result[parsed.data.id] = fromPublicAsset(parsed.data);
    }
  }
  return result;
}

async function getPublishedUnits(projectId: string): Promise<{ units: PublicUnit[]; statusColors: SiteRenderData["statusColors"] }> {
  "use cache";
  cacheLife(PUBLISHED_CACHE);
  cacheTag(siteTags.units(projectId), siteTags.project(projectId));
  const { data, error } = await anonClient().rpc("get_public_units", { p_project_id: projectId });
  if (error) {
    throw error;
  }
  const colors = (data as { status_colors?: { organization?: unknown; project?: unknown } } | null)?.status_colors;
  return { units: parsePublicUnits(data) ?? [], statusColors: resolveStatusColors(colors?.organization, colors?.project) };
}

async function getPublishedSelectorCached(selectorId: string): Promise<PublishedSelector | null> {
  "use cache";
  cacheLife(PUBLISHED_CACHE);
  cacheTag(siteTags.selector(selectorId));
  const { data, error } = await anonClient().rpc("get_published_selector", { p_selector_id: selectorId });
  if (error) {
    throw error;
  }
  const selector = parsePublishedSelector(data);
  if (selector) {
    cacheTag(siteTags.units(selector.project.id));
  }
  return selector;
}

function selectorIdsIn(blocks: Block[]): string[] {
  return [...new Set(blocks.flatMap((block) => (block.type === "selector" && block.props.selector_id ? [block.props.selector_id] : [])))];
}

function assetIdsFor(blocks: Block[], extra: (string | null)[]): string[] {
  return [...new Set([...blocks.flatMap(blockAssetIds), ...extra.filter((id): id is string => Boolean(id))])].slice(0, 200);
}

/** Alt en publisert side trenger: side, filer, enheter og boligvelgere. */
export async function getPublishedRenderData(
  site: ResolvedSite,
  page: NonNullable<SiteRenderData["page"]> | null,
  basePath = "",
): Promise<SiteRenderData> {
  const blocks = page?.blocks ?? [];
  const logoId = themeLogoId(site.themeOverrides);
  const [assets, units, selectors] = await Promise.all([
    getPublishedAssets(site.id, assetIdsFor(blocks, [logoId, page?.ogAssetId ?? null, site.seoDefaults.og_asset_id])),
    getPublishedUnits(site.project.id),
    Promise.all(selectorIdsIn(blocks).map((id) => getPublishedSelectorCached(id))),
  ]);
  const env = publicEnv();
  return {
    mode: "published",
    site: { id: site.id, subdomain: site.subdomain, url: siteUrl(site.subdomain, site.primaryHostname, env.platformDomain, env.appUrl) },
    basePath,
    organization: { name: site.organization.name, locale: site.organization.locale },
    project: site.project,
    theme: site.theme,
    logo: logoId ? (assets[logoId] ?? null) : site.organization.logo ? fromPublicAsset(site.organization.logo) : null,
    nav: site.nav,
    footer: site.footer,
    seoDefaults: site.seoDefaults,
    pages: site.pages,
    page,
    assets,
    units: units.units,
    statusColors: units.statusColors,
    selectors: Object.fromEntries(selectors.flatMap((selector) => (selector ? [[selector.id, selector]] : []))),
  };
}

// -----------------------------------------------------------------------------
// Utkast: editorens forhåndsvisning (innlogget) og delt forhåndsvisning (signert lenke)
// -----------------------------------------------------------------------------

type ContactRow = { name?: unknown; title?: unknown; email?: unknown; phone?: unknown; image_asset_id?: unknown; is_public?: unknown };

/**
 * Utkastet til en prosjektside med alt som trengs for å vise den. Klienten er
 * enten brukerens (RLS, editoren) eller service-rollen (etter kontroll av en
 * signert lenke). Enheter og filer leses som i admin, med samme regler for
 * skjult pris som på den publiserte siden.
 */
export async function loadDraftSite(client: Client, siteId: string): Promise<DraftSite | null> {
  const { data: site, error } = await client
    .from("sites")
    .select("id, organization_id, project_id, subdomain, theme, nav, footer, seo_defaults")
    .eq("id", siteId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!site) {
    return null;
  }

  const [pagesResult, projectResult, organizationResult, unitsResult, selectorsResult, domainResult] = await Promise.all([
    client
      .from("pages")
      .select("id, title, slug, is_home, seo_title, seo_description, og_asset_id, draft_blocks, sort_order")
      .eq("site_id", site.id)
      .order("sort_order")
      .order("created_at"),
    client
      .from("projects")
      .select("id, name, slug, phase, address, postal_code, city, municipality, lat, lng, description, milestones, contacts, settings")
      .eq("id", site.project_id)
      .single(),
    client.from("organizations").select("id, name, locale, brand, status_colors, logo_asset_id").eq("id", site.organization_id).single(),
    client
      .from("units")
      .select(
        "id, unit_number, slug, title, unit_type, status, floor, rooms, bedrooms, bathrooms, bra_i, bra_e, bra_b, tba, plot_area, price, purchase_costs, shared_debt, monthly_fee, ownership_type, orientation, parking, storage, sort_order, stage:stages(id, name), building:buildings(id, name)",
      )
      .eq("project_id", site.project_id)
      .eq("is_hidden", false)
      .order("sort_order")
      .order("unit_number")
      .limit(5000),
    client.from("selectors").select("id").eq("project_id", site.project_id),
    client.from("domains").select("hostname").eq("site_id", site.id).eq("is_primary", true).not("verified_at", "is", null).maybeSingle(),
  ]);
  for (const result of [pagesResult, projectResult, organizationResult, unitsResult, selectorsResult, domainResult]) {
    if (result.error) {
      throw result.error;
    }
  }
  const project = projectResult.data;
  const organization = organizationResult.data;
  if (!project || !organization) {
    return null;
  }
  const settings = (project.settings ?? {}) as { show_price_on_sold?: unknown; status_colors?: unknown };
  const showPriceOnSold = settings.show_price_on_sold === true;

  const draftPages: DraftPage[] = (pagesResult.data ?? []).map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    isHome: page.is_home,
    seoTitle: page.seo_title,
    seoDescription: page.seo_description,
    ogAssetId: page.og_asset_id,
    blocks: parseBlocks(page.draft_blocks),
  }));

  const contacts = (Array.isArray(project.contacts) ? (project.contacts as ContactRow[]) : []).filter(
    (contact) => typeof contact === "object" && contact !== null && contact.is_public !== false,
  );
  const logoId = themeLogoId(site.theme) ?? organization.logo_asset_id;
  const seoDefaults = parseSeoDefaults(site.seo_defaults);
  const assetIds = [
    ...new Set([
      ...draftPages.flatMap((page) => [...page.blocks.flatMap(blockAssetIds), page.ogAssetId]),
      logoId,
      seoDefaults.og_asset_id,
      ...contacts.map((contact) => (typeof contact.image_asset_id === "string" ? contact.image_asset_id : null)),
    ]),
  ].filter((id): id is string => typeof id === "string");

  const assets = await loadAssets(client, site.organization_id, assetIds);
  const selectors = await loadSelectorPreviews(client, (selectorsResult.data ?? []).map((row) => row.id));

  const units: PublicUnit[] = (unitsResult.data ?? []).map((unit) => {
    const hidden = isPriceHidden(unit.status, showPriceOnSold);
    return {
      id: unit.id,
      unit_number: unit.unit_number,
      slug: unit.slug,
      title: unit.title,
      unit_type: unit.unit_type,
      status: unit.status,
      floor: unit.floor,
      rooms: unit.rooms,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      bra_i: unit.bra_i,
      bra_e: unit.bra_e,
      bra_b: unit.bra_b,
      tba: unit.tba,
      plot_area: unit.plot_area,
      price_hidden: hidden,
      price: hidden ? null : unit.price,
      purchase_costs: hidden ? null : unit.purchase_costs,
      shared_debt: hidden ? null : unit.shared_debt,
      monthly_fee: unit.monthly_fee,
      ownership_type: unit.ownership_type,
      orientation: unit.orientation,
      parking: unit.parking,
      storage: unit.storage,
      sort_order: unit.sort_order,
      stage: unit.stage ?? null,
      building: unit.building ?? null,
      floor_plan: null,
    };
  });

  const siteContacts: SiteContact[] = contacts.map((contact) => ({
    name: typeof contact.name === "string" ? contact.name : null,
    title: typeof contact.title === "string" ? contact.title : null,
    email: typeof contact.email === "string" ? contact.email : null,
    phone: typeof contact.phone === "string" ? contact.phone : null,
    image: typeof contact.image_asset_id === "string" ? (assets[contact.image_asset_id] ?? null) : null,
  }));

  const siteProject: SiteProject = {
    id: project.id,
    name: project.name,
    slug: project.slug,
    phase: project.phase,
    address: project.address,
    postalCode: project.postal_code,
    city: project.city,
    municipality: project.municipality,
    lat: project.lat,
    lng: project.lng,
    description: project.description,
    milestones: (Array.isArray(project.milestones) ? project.milestones : []).flatMap((item) => {
      const milestone = item as { key?: unknown; label?: unknown; text?: unknown; date?: unknown };
      return typeof milestone === "object" && milestone !== null
        ? [
            {
              key: typeof milestone.key === "string" ? milestone.key : "custom",
              label: typeof milestone.label === "string" ? milestone.label : null,
              text: typeof milestone.text === "string" ? milestone.text : null,
              date: typeof milestone.date === "string" ? milestone.date : null,
            },
          ]
        : [];
    }),
    contacts: siteContacts,
    showPriceOnSold,
  };

  const env = publicEnv();
  return {
    site: { id: site.id, subdomain: site.subdomain, url: siteUrl(site.subdomain, domainResult.data?.hostname ?? null, env.platformDomain, env.appUrl) },
    organization: { name: organization.name, locale: organization.locale },
    project: siteProject,
    theme: resolveTheme(organization.brand, site.theme),
    themeOverrides: site.theme,
    brand: organization.brand,
    logo: logoId ? (assets[logoId] ?? null) : null,
    nav: parseNav(site.nav),
    footer: parseFooter(site.footer),
    seoDefaults,
    pages: draftPages.map((page) => ({ id: page.id, title: page.title, slug: page.slug, isHome: page.isHome })),
    draftPages,
    assets,
    units,
    statusColors: resolveStatusColors(organization.status_colors, settings.status_colors),
    selectors,
  };
}

async function loadAssets(client: Client, organizationId: string, ids: string[]): Promise<Record<string, SiteAsset>> {
  if (ids.length === 0) {
    return {};
  }
  const { data, error } = await client.from("assets").select(ASSET_COLUMNS).eq("organization_id", organizationId).in("id", ids.slice(0, 500));
  if (error) {
    throw error;
  }
  return Object.fromEntries(data.map((row) => [row.id, fromMediaAsset(toMediaAsset(row))]));
}

/** Boligvelgerne slik de blir når de publiseres (utkastet). */
async function loadSelectorPreviews(client: Client, ids: string[]): Promise<Record<string, PublishedSelector>> {
  const entries = await Promise.all(
    ids.map(async (id) => {
      const { data, error } = await client.rpc("get_selector_preview", { p_selector_id: id });
      if (error) {
        return null;
      }
      const selector = parsePublishedSelector(data);
      return selector ? ([id, selector] as const) : null;
    }),
  );
  return Object.fromEntries(entries.filter((entry): entry is readonly [string, PublishedSelector] => entry !== null));
}

/** Én enhet på en publisert prosjektside (enhetssiden /bolig/{slug}). */
export async function getPublishedUnit(projectId: string, slug: string) {
  "use cache";
  cacheLife(PUBLISHED_CACHE);
  cacheTag(siteTags.units(projectId), siteTags.project(projectId));
  const { data, error } = await anonClient().rpc("get_public_unit", { p_project_id: projectId, p_slug: slug });
  if (error) {
    throw error;
  }
  return parsePublicUnitDetail(data);
}

/** Enhetene i et publisert prosjekt (sitemap). */
export async function getPublishedUnitSlugs(projectId: string): Promise<string[]> {
  return (await getPublishedUnits(projectId)).units.map((unit) => unit.slug);
}
