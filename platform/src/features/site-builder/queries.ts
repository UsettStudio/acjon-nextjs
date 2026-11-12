import "server-only";

import { cache } from "react";

import { getAssetsByIds, type MediaAsset } from "@/features/media/assets";
import { blockAssetIds, parseBlocks, type Block } from "@/features/site-builder/blocks";
import {
  parseFooter,
  parseNav,
  parseSeoDefaults,
  siteUrl,
  themeLogoId,
  type NavItem,
  type SeoDefaults,
  type SiteFooter,
  parseCookieSettings,
  type CookieSettings,
} from "@/features/site-builder/site";
import { parseTheme, type ThemeOverrides } from "@/features/site-builder/theme";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type EditorPage = {
  id: string;
  title: string;
  slug: string;
  isHome: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogAssetId: string | null;
  blocks: Block[];
  publishedAt: string | null;
};

export type SiteEditorData = {
  site: {
    id: string;
    subdomain: string;
    url: string;
    theme: ThemeOverrides;
    nav: NavItem[];
    footer: SiteFooter;
    seoDefaults: SeoDefaults;
    cookieSettings: CookieSettings;
    publishedAt: string | null;
  };
  pages: EditorPage[];
  selectors: { id: string; name: string; publishedAt: string | null; views: { id: string; name: string }[] }[];
  brand: ThemeOverrides;
  /** Organisasjonens logo, som brukes når prosjektsiden ikke har sin egen. */
  brandLogoAssetId: string | null;
  organizationLocale: string;
  /** Filer som brukes i blokkene, logo og delingsbilder, med miniatyrer til skjemaene. */
  assets: Record<string, MediaAsset>;
  hasUnpublishedChanges: boolean;
};

/** Prosjektsiden til et prosjekt for editoren, eller null hvis den ikke er opprettet ennå. */
export const getSiteEditorData = cache(async (organizationId: string, projectId: string): Promise<SiteEditorData | null> => {
  const supabase = await createClient();
  const { data: site, error } = await supabase
    .from("sites")
    .select("id, subdomain, theme, nav, footer, seo_defaults, cookie_settings, published_at")
    .eq("project_id", projectId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!site) {
    return null;
  }
  const [pages, selectors, views, organization, state, domain] = await Promise.all([
    supabase
      .from("pages")
      .select("id, title, slug, is_home, seo_title, seo_description, og_asset_id, draft_blocks, published_at, sort_order")
      .eq("site_id", site.id)
      .order("sort_order")
      .order("created_at"),
    supabase.from("selectors").select("id, name, published_at").eq("project_id", projectId).order("created_at"),
    supabase.from("selector_views").select("id, name, selector_id, sort_order").eq("project_id", projectId).order("sort_order"),
    supabase.from("organizations").select("brand, locale, logo_asset_id").eq("id", organizationId).single(),
    supabase.rpc("get_site_publish_state", { p_site_id: site.id }),
    supabase.from("domains").select("hostname").eq("site_id", site.id).eq("is_primary", true).not("verified_at", "is", null).maybeSingle(),
  ]);
  for (const result of [pages, selectors, views, organization, state, domain]) {
    if (result.error) {
      throw result.error;
    }
  }
  const editorPages: EditorPage[] = (pages.data ?? []).map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    isHome: page.is_home,
    seoTitle: page.seo_title,
    seoDescription: page.seo_description,
    ogAssetId: page.og_asset_id,
    blocks: parseBlocks(page.draft_blocks),
    publishedAt: page.published_at,
  }));
  const theme = parseTheme(site.theme);
  const seoDefaults = parseSeoDefaults(site.seo_defaults);
  const assetIds = [
    ...new Set([
      ...editorPages.flatMap((page) => [...page.blocks.flatMap(blockAssetIds), page.ogAssetId]),
      themeLogoId(site.theme),
      organization.data?.logo_asset_id ?? null,
      seoDefaults.og_asset_id,
    ]),
  ].filter((id): id is string => typeof id === "string");
  const assets = await getAssetsByIds(organizationId, assetIds);
  const env = publicEnv();
  return {
    site: {
      id: site.id,
      subdomain: site.subdomain,
      url: siteUrl(site.subdomain, domain.data?.hostname ?? null, env.platformDomain, env.appUrl),
      theme,
      nav: parseNav(site.nav),
      footer: parseFooter(site.footer),
      seoDefaults,
      cookieSettings: parseCookieSettings(site.cookie_settings),
      publishedAt: site.published_at,
    },
    pages: editorPages,
    selectors: (selectors.data ?? []).map((selector) => ({
      id: selector.id,
      name: selector.name,
      publishedAt: selector.published_at,
      views: (views.data ?? []).filter((view) => view.selector_id === selector.id).map((view) => ({ id: view.id, name: view.name })),
    })),
    brand: parseTheme(organization.data?.brand),
    brandLogoAssetId: organization.data?.logo_asset_id ?? null,
    organizationLocale: organization.data?.locale ?? "nb",
    assets: Object.fromEntries(assets.map((asset) => [asset.id, asset])),
    hasUnpublishedChanges: (state.data as { has_changes?: boolean } | null)?.has_changes === true,
  };
});
