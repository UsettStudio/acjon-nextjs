/**
 * Prosjektsiden: meny, bunntekst, SEO-standarder og dataene en side trenger
 * for å vises. Brukes både av den publiserte siden, forhåndsvisningen og editoren.
 */

import { z } from "zod";

import { linkSchema, parseBlocks, type Block } from "@/features/site-builder/blocks";
import { resolveTheme, type ResolvedTheme } from "@/features/site-builder/theme";
import { RESERVED_SUBDOMAINS } from "@/lib/hosts";
import type { SiteAsset } from "@/features/site-builder/assets";
import { fromPublicAsset } from "@/features/site-builder/assets";
import type { PublicAsset, PublicUnit, PublishedSelector } from "@/features/selector/model";
import type { UnitStatus } from "@/features/units/fields";

const text = (max: number) => z.string().max(max, { error: "textTooLong" }).default("");

export const SUBDOMAIN_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
export const PAGE_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Samme liste som app.is_reserved_page_slug() i databasen. Underdomenene står i lib/hosts.ts. */
export const RESERVED_PAGE_SLUGS = new Set([
  "bolig", "personvern", "informasjonskapsler", "api", "embed", "preview",
  "sitemap-xml", "robots-txt", "favoritter", "sammenlign",
]);

export const subdomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(SUBDOMAIN_PATTERN, { error: "subdomainFormat" })
  .refine((value) => !RESERVED_SUBDOMAINS.has(value), { error: "subdomainReserved" });

export const pageSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(80, { error: "pageSlugFormat" })
  .regex(PAGE_SLUG_PATTERN, { error: "pageSlugFormat" })
  .refine((value) => !RESERVED_PAGE_SLUGS.has(value), { error: "pageSlugReserved" });

export const navItemSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().trim().min(1, { error: "required" }).max(60, { error: "textTooLong" }),
  link: linkSchema,
});

export type NavItem = z.infer<typeof navItemSchema>;

export const navSchema = z.array(navItemSchema).max(12);

export const footerSchema = z.object({
  text: text(2000),
  show_contacts: z.boolean().default(true),
  links: z
    .array(
      z.object({
        label: z.string().trim().min(1, { error: "required" }).max(60, { error: "textTooLong" }),
        url: z
          .string()
          .trim()
          .max(2048, { error: "textTooLong" })
          .regex(/^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+0-9 ()-]+)$/i, { error: "urlInvalid" }),
      }),
    )
    .max(10)
    .default([]),
});

export type SiteFooter = z.output<typeof footerSchema>;

export const seoDefaultsSchema = z.object({
  description: text(300),
  og_asset_id: z.uuid({ error: "optionInvalid" }).nullable().default(null),
});

export type SeoDefaults = z.output<typeof seoDefaultsSchema>;

export function parseNav(value: unknown): NavItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const parsed = navItemSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseFooter(value: unknown): SiteFooter {
  const parsed = footerSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : footerSchema.parse({});
}

export function parseSeoDefaults(value: unknown): SeoDefaults {
  const parsed = seoDefaultsSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : seoDefaultsSchema.parse({});
}

// -----------------------------------------------------------------------------
// Data for visning av en side
// -----------------------------------------------------------------------------

export type SitePageSummary = { id: string; title: string; slug: string; isHome: boolean };

export type SiteMilestone = { key: string; label: string | null; text: string | null; date: string | null };

export type SiteProject = {
  id: string;
  name: string;
  slug: string;
  phase: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  municipality: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  milestones: SiteMilestone[];
  contacts: SiteContact[];
  showPriceOnSold: boolean;
};

export type SiteContact = { name: string | null; title: string | null; email: string | null; phone: string | null; image: SiteAsset | null };

export type SiteRenderMode = "published" | "preview" | "editor";

/** Alt som trengs for å vise en side på prosjektsiden. */
export type SiteRenderData = {
  mode: SiteRenderMode;
  site: { id: string; subdomain: string; url: string };
  /** Start på lenker internt på siden: "" på prosjektsiden, /preview/{token} i delt forhåndsvisning. */
  basePath: string;
  organization: { name: string; locale: string };
  project: SiteProject;
  theme: ResolvedTheme;
  logo: SiteAsset | null;
  nav: NavItem[];
  footer: SiteFooter;
  seoDefaults: SeoDefaults;
  pages: SitePageSummary[];
  page: {
    id: string;
    title: string;
    slug: string;
    isHome: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
    ogAssetId: string | null;
    blocks: Block[];
  } | null;
  assets: Record<string, SiteAsset>;
  units: PublicUnit[];
  statusColors: Record<UnitStatus, string>;
  selectors: Record<string, PublishedSelector>;
};

/** Adressen til en side på prosjektsiden, med basePath for forhåndsvisning. */
export function pageHref(data: Pick<SiteRenderData, "basePath" | "pages">, pageId: string): string | null {
  const page = data.pages.find((item) => item.id === pageId);
  if (!page) {
    return null;
  }
  return page.isHome ? data.basePath || "/" : `${data.basePath}/${page.slug}`;
}

export function unitHref(basePath: string, slug: string): string {
  return `${basePath}/bolig/${encodeURIComponent(slug)}`;
}

/** Lenke fra en knapp eller menyen. null hvis målet ikke finnes (for eksempel en slettet side). */
export function resolveLink(
  data: Pick<SiteRenderData, "basePath" | "pages">,
  link: z.infer<typeof linkSchema> | null,
): { href: string; external: boolean } | null {
  if (!link) {
    return null;
  }
  switch (link.type) {
    case "page": {
      const href = pageHref(data, link.page_id);
      return href ? { href, external: false } : null;
    }
    case "block":
      return { href: `#${link.block_id}`, external: false };
    case "url":
      return { href: link.url, external: /^https?:/i.test(link.url) };
  }
}

/** Offentlig adresse til prosjektsiden: eget domene hvis det finnes, ellers underdomenet. */
export function siteUrl(subdomain: string, primaryHostname: string | null, platformDomain: string, appUrl: string): string {
  const protocol = appUrl.startsWith("http://") ? "http" : "https";
  return primaryHostname ? `${protocol}://${primaryHostname}` : `${protocol}://${subdomain}.${platformDomain}`;
}

// -----------------------------------------------------------------------------
// Tolking av resolve_site og get_published_page
// -----------------------------------------------------------------------------

const nullableString = z.string().nullish().transform((value) => value ?? null);
const nullableNumber = z.number().nullish().transform((value) => value ?? null);

const publicAssetLike = z
  .object({
    id: z.string(),
    path: z.string(),
    mime: z.string(),
    width: nullableNumber,
    height: nullableNumber,
    alt: nullableString,
    filename: nullableString,
    variants: z.array(z.object({ width: z.number(), height: z.number(), path: z.string() })).catch([]),
  })
  .nullable()
  .catch(null);

const resolvedSiteSchema = z.object({
  site: z.object({
    id: z.string(),
    subdomain: z.string(),
    primary_hostname: nullableString,
    config: z
      .object({
        theme: z.unknown(),
        nav: z.unknown(),
        footer: z.unknown(),
        seo_defaults: z.unknown(),
        home_page_id: nullableString,
      })
      .catch({ theme: {}, nav: [], footer: {}, seo_defaults: {}, home_page_id: null }),
  }),
  project: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    phase: z.string(),
    address: nullableString,
    postal_code: nullableString,
    city: nullableString,
    municipality: nullableString,
    lat: nullableNumber,
    lng: nullableNumber,
    description: nullableString,
    milestones: z
      .array(z.object({ key: z.string().catch("custom"), label: nullableString, text: nullableString, date: nullableString }))
      .catch([]),
    show_price_on_sold: z.boolean().catch(false),
    contacts: z
      .array(
        z.object({
          name: nullableString,
          title: nullableString,
          email: nullableString,
          phone: nullableString,
          image: publicAssetLike,
        }),
      )
      .catch([]),
  }),
  organization: z.object({
    name: z.string(),
    locale: z.string().catch("nb"),
    brand: z.unknown(),
    logo: publicAssetLike,
  }),
  pages: z
    .array(z.object({ id: z.string(), slug: z.string(), title: nullableString, is_home: z.boolean() }))
    .catch([]),
});

export type ResolvedSite = {
  id: string;
  subdomain: string;
  primaryHostname: string | null;
  organization: SiteRenderData["organization"] & { brand: unknown; logo: PublicAsset | null };
  project: SiteProject;
  theme: ResolvedTheme;
  themeOverrides: unknown;
  logo: PublicAsset | null;
  nav: NavItem[];
  footer: SiteFooter;
  seoDefaults: SeoDefaults;
  pages: SitePageSummary[];
};

export function parseResolvedSite(value: unknown): ResolvedSite | null {
  const parsed = resolvedSiteSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }
  const { site, project, organization, pages } = parsed.data;
  const themeOverrides = site.config.theme;
  const themeLogoId =
    typeof themeOverrides === "object" && themeOverrides !== null && "logo_asset_id" in themeOverrides
      ? (themeOverrides as { logo_asset_id?: unknown }).logo_asset_id
      : null;
  return {
    id: site.id,
    subdomain: site.subdomain,
    primaryHostname: site.primary_hostname,
    organization: { name: organization.name, locale: organization.locale, logo: organization.logo, brand: organization.brand },
    project: {
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
      milestones: project.milestones,
      contacts: project.contacts.map((contact) => ({ ...contact, image: contact.image ? fromPublicAsset(contact.image) : null })),
      showPriceOnSold: project.show_price_on_sold,
    },
    theme: resolveTheme(organization.brand, themeOverrides),
    themeOverrides,
    // Logoen fra temaet hentes sammen med de andre filene. Uten egen logo brukes organisasjonens.
    logo: typeof themeLogoId === "string" ? null : organization.logo,
    nav: parseNav(site.config.nav),
    footer: parseFooter(site.config.footer),
    seoDefaults: parseSeoDefaults(site.config.seo_defaults),
    pages: pages.map((page) => ({ id: page.id, title: page.title ?? page.slug, slug: page.slug, isHome: page.is_home })),
  };
}

const publishedPageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  is_home: z.boolean(),
  meta: z
    .object({
      title: nullableString,
      seo_title: nullableString,
      seo_description: nullableString,
      og_asset_id: nullableString,
    })
    .catch({ title: null, seo_title: null, seo_description: null, og_asset_id: null }),
  blocks: z.unknown(),
});

export function parsePublishedPage(value: unknown): SiteRenderData["page"] {
  const parsed = publishedPageSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }
  const page = parsed.data;
  return {
    id: page.id,
    title: page.meta.title ?? page.slug,
    slug: page.slug,
    isHome: page.is_home,
    seoTitle: page.meta.seo_title,
    seoDescription: page.meta.seo_description,
    ogAssetId: page.meta.og_asset_id,
    blocks: parseBlocks(page.blocks).filter((block) => !block.hidden),
  };
}

/** Logo fra temaet (egen for prosjektsiden), ellers organisasjonens. */
export function themeLogoId(themeOverrides: unknown): string | null {
  if (typeof themeOverrides === "object" && themeOverrides !== null && "logo_asset_id" in themeOverrides) {
    const value = (themeOverrides as { logo_asset_id?: unknown }).logo_asset_id;
    return typeof value === "string" ? value : null;
  }
  return null;
}
