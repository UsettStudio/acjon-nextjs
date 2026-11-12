"use server";

import { updateTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { getAssetsByIds, type MediaAsset } from "@/features/media/assets";
import { blockAssetIds, blocksSchema, parseBlocks, type Block } from "@/features/site-builder/blocks";
import { createPreviewToken } from "@/features/site-builder/preview-token";
import { siteTags } from "@/features/site-builder/render-data";
import { footerSchema, navSchema, pageSlugSchema, seoDefaultsSchema, siteUrl, subdomainSchema } from "@/features/site-builder/site";
import { buildTemplate, expandToFull, TEMPLATE_KINDS, type TemplateContext, type TemplateText } from "@/features/site-builder/templates";
import { themeSchema } from "@/features/site-builder/theme";
import { isLocale } from "@/i18n/config";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { ActionError, parseInput, postgresErrorCode, requireOrgCapability, runAction } from "@/lib/actions/server";
import { appUrl, publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";
import { createClient, type ServerSupabaseClient } from "@/lib/supabase/server";

/**
 * subdomainTaken / pageSlugTaken: adressen er i bruk.
 * needsHome: prosjektsiden mangler forside og kan ikke publiseres.
 * homePage: forsiden kan ikke slettes.
 */
type SiteError = "subdomainTaken" | "pageSlugTaken" | "needsHome" | "homePage" | "selectorNotInProject";

export type SitePublishState = { publishedAt: string | null; hasUnpublishedChanges: boolean };

const uuid = z.uuid();

function requireId(value: unknown): string {
  const parsed = uuid.safeParse(value);
  if (!parsed.success) {
    throw new ActionError("invalidInput");
  }
  return parsed.data;
}

function writeError(error: unknown): ActionResult<never, SiteError> {
  switch (postgresErrorCode(error)) {
    case "42501":
      return fail("forbidden");
    case "PGRST116":
      return fail("notFound");
    case "22023":
    case "23514":
    case "23503":
    case "22P02":
      return fail("invalidInput");
    default:
      throw error;
  }
}

async function publishState(supabase: ServerSupabaseClient, siteId: string): Promise<SitePublishState> {
  const { data, error } = await supabase.rpc("get_site_publish_state", { p_site_id: siteId });
  if (error) {
    throw error;
  }
  const state = z.object({ published_at: z.string().nullable(), has_changes: z.boolean() }).parse(data);
  return { publishedAt: state.published_at, hasUnpublishedChanges: state.has_changes };
}

/** Malteksten på organisasjonens språk, og prosjektets første boligvelger. */
async function templateContext(supabase: ServerSupabaseClient, projectId: string, organizationId: string): Promise<TemplateContext> {
  const [project, organization, selector] = await Promise.all([
    supabase.from("projects").select("name, description").eq("id", projectId).single(),
    supabase.from("organizations").select("locale").eq("id", organizationId).single(),
    supabase.from("selectors").select("id, published_at").eq("project_id", projectId).order("published_at", { ascending: false, nullsFirst: false }).order("created_at").limit(1).maybeSingle(),
  ]);
  if (project.error) {
    throw project.error;
  }
  const locale = isLocale(organization.data?.locale) ? organization.data.locale : "nb";
  const t = await getTranslations({ locale, namespace: "siteBuilder.templates" });
  return {
    projectName: project.data.name,
    description: project.data.description,
    selectorId: selector.data?.id ?? null,
    t: (key: TemplateText) => t(key),
  };
}

/** Boligvelger-blokker kan bare vise velgere i samme prosjekt. */
async function assertSelectorsInProject(supabase: ServerSupabaseClient, projectId: string, blocks: Block[]): Promise<boolean> {
  const ids = [...new Set(blocks.flatMap((block) => (block.type === "selector" && block.props.selector_id ? [block.props.selector_id] : [])))];
  if (ids.length === 0) {
    return true;
  }
  const { data, error } = await supabase.from("selectors").select("id").eq("project_id", projectId).in("id", ids);
  if (error) {
    throw error;
  }
  return data.length === ids.length;
}

// -----------------------------------------------------------------------------
// Opprett og slett prosjektside
// -----------------------------------------------------------------------------

const createSiteSchema = z.object({
  template: z.enum(TEMPLATE_KINDS, { error: "optionInvalid" }),
  subdomain: subdomainSchema,
});

export async function createSite(
  organizationId: string,
  projectId: string,
  input: z.input<typeof createSiteSchema>,
): Promise<ActionResult<{ siteId: string }, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(createSiteSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const template = buildTemplate(parsed.data.template, await templateContext(supabase, requireId(projectId), organizationId));
    const { data, error } = await supabase.rpc("create_site", {
      p_project_id: projectId,
      p_subdomain: parsed.data.subdomain,
      p_site: { nav: template.nav, footer: template.footer, seo_defaults: template.seo_defaults, theme: {} },
      p_pages: template.pages,
    });
    if (error) {
      if (postgresErrorCode(error) === "23505") {
        return error.message.includes("subdomain") ? fail("subdomainTaken", { subdomain: "subdomainTaken" }) : fail("invalidInput");
      }
      return writeError(error);
    }
    return ok({ siteId: z.uuid().parse(data) });
  });
}

export async function deleteSite(organizationId: string, siteId: string): Promise<ActionResult<undefined, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { data: site } = await supabase.from("sites").select("subdomain").eq("id", requireId(siteId)).maybeSingle();
    const { error, count } = await supabase.from("sites").delete({ count: "exact" }).eq("id", siteId).eq("organization_id", organizationId);
    if (error) {
      return writeError(error);
    }
    if (count === 0) {
      return fail("notFound");
    }
    updateTag(siteTags.site(siteId));
    if (site) {
      updateTag(siteTags.key(site.subdomain));
    }
    return ok();
  });
}

// -----------------------------------------------------------------------------
// Utkast: blokker, sider og innstillinger
// -----------------------------------------------------------------------------

/** Lagrer blokkene på en side (autolagring). Svarer med publiseringsstatusen. */
export async function savePageBlocks(
  organizationId: string,
  pageId: string,
  blocks: unknown,
): Promise<ActionResult<SitePublishState, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(blocksSchema, blocks);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, site_id, project_id")
      .eq("id", requireId(pageId))
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (pageError) {
      return writeError(pageError);
    }
    if (!page) {
      return fail("notFound");
    }
    if (!(await assertSelectorsInProject(supabase, page.project_id, parsed.data))) {
      return fail("selectorNotInProject");
    }
    const { error } = await supabase.from("pages").update({ draft_blocks: parsed.data }).eq("id", page.id).select("id").single();
    if (error) {
      return writeError(error);
    }
    return ok(await publishState(supabase, page.site_id));
  });
}

/** Blokkene som mangler for å bygge ut siden til full prosjektside, på organisasjonens språk. */
export async function expandPageToFull(
  organizationId: string,
  projectId: string,
  blocks: unknown,
): Promise<ActionResult<Block[], SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(blocksSchema, blocks);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    return ok(expandToFull(parsed.data, await templateContext(supabase, requireId(projectId), organizationId)));
  });
}

const pageSettingsSchema = z.object({
  title: z.string().trim().min(1, { error: "nameLength" }).max(200, { error: "nameLength" }),
  slug: pageSlugSchema,
  seoTitle: z
    .string()
    .trim()
    .max(200, { error: "textTooLong" })
    .transform((value) => value || null),
  seoDescription: z
    .string()
    .trim()
    .max(500, { error: "textTooLong" })
    .transform((value) => value || null),
  ogAssetId: z.uuid({ error: "optionInvalid" }).nullable(),
});

export type PageSettingsInput = z.input<typeof pageSettingsSchema>;

export async function createPage(
  organizationId: string,
  siteId: string,
  input: PageSettingsInput,
): Promise<ActionResult<{ id: string }, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(pageSettingsSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, project_id")
      .eq("id", requireId(siteId))
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (siteError) {
      return writeError(siteError);
    }
    if (!site) {
      return fail("notFound");
    }
    const { data: last } = await supabase.from("pages").select("sort_order").eq("site_id", site.id).order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const id = crypto.randomUUID();
    const { error } = await supabase.from("pages").insert({
      id,
      organization_id: organizationId,
      project_id: site.project_id,
      site_id: site.id,
      title: parsed.data.title,
      slug: parsed.data.slug,
      seo_title: parsed.data.seoTitle,
      seo_description: parsed.data.seoDescription,
      og_asset_id: parsed.data.ogAssetId,
      sort_order: (last?.sort_order ?? 0) + 1,
      draft_blocks: [],
    });
    if (error) {
      if (postgresErrorCode(error) === "23505") {
        return fail("pageSlugTaken", { slug: "pageSlugTaken" });
      }
      return writeError(error);
    }
    return ok({ id });
  });
}

export async function updatePageSettings(
  organizationId: string,
  pageId: string,
  input: PageSettingsInput,
): Promise<ActionResult<undefined, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(pageSettingsSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase
      .from("pages")
      .update({
        title: parsed.data.title,
        slug: parsed.data.slug,
        seo_title: parsed.data.seoTitle,
        seo_description: parsed.data.seoDescription,
        og_asset_id: parsed.data.ogAssetId,
      })
      .eq("id", requireId(pageId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      if (postgresErrorCode(error) === "23505") {
        return fail("pageSlugTaken", { slug: "pageSlugTaken" });
      }
      return writeError(error);
    }
    return ok();
  });
}

/** Sletter en side. Den forsvinner fra den publiserte prosjektsiden med en gang. Forsiden kan ikke slettes. */
export async function deletePage(organizationId: string, pageId: string): Promise<ActionResult<undefined, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, site_id, is_home")
      .eq("id", requireId(pageId))
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (pageError) {
      return writeError(pageError);
    }
    if (!page) {
      return fail("notFound");
    }
    if (page.is_home) {
      return fail("homePage");
    }
    const { error } = await supabase.from("pages").delete().eq("id", page.id);
    if (error) {
      return writeError(error);
    }
    updateTag(siteTags.site(page.site_id));
    return ok();
  });
}

export async function setHomePage(organizationId: string, pageId: string): Promise<ActionResult<undefined, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_home_page", { p_page_id: requireId(pageId) });
    if (error) {
      return writeError(error);
    }
    return ok();
  });
}

export async function reorderPages(organizationId: string, siteId: string, pageIds: string[]): Promise<ActionResult<undefined, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const ids = z.array(z.uuid()).min(1).max(50).safeParse(pageIds);
    if (!ids.success) {
      return fail("invalidInput");
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc("reorder_pages", { p_site_id: requireId(siteId), p_page_ids: ids.data });
    if (error) {
      return writeError(error);
    }
    return ok();
  });
}

const siteSettingsSchema = z
  .object({
    nav: navSchema,
    footer: footerSchema,
    theme: themeSchema,
    seoDefaults: seoDefaultsSchema,
  })
  .partial();

export type SiteSettingsInput = z.input<typeof siteSettingsSchema>;

/** Meny, bunntekst, tema og SEO-standarder. Går ut på den publiserte siden ved neste publisering. */
export async function saveSiteSettings(
  organizationId: string,
  siteId: string,
  input: SiteSettingsInput,
): Promise<ActionResult<SitePublishState, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(siteSettingsSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const values: Database["public"]["Tables"]["sites"]["Update"] = {};
    if (parsed.data.nav) {
      values.nav = parsed.data.nav;
    }
    if (parsed.data.footer) {
      values.footer = parsed.data.footer;
    }
    if (parsed.data.theme) {
      values.theme = parsed.data.theme;
    }
    if (parsed.data.seoDefaults) {
      values.seo_defaults = parsed.data.seoDefaults;
    }
    const { error } = await supabase
      .from("sites")
      .update(values)
      .eq("id", requireId(siteId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      return writeError(error);
    }
    return ok(await publishState(supabase, siteId));
  });
}

/** Nytt underdomene. Gjelder med en gang, også for den publiserte siden. */
export async function updateSubdomain(
  organizationId: string,
  siteId: string,
  subdomain: string,
): Promise<ActionResult<{ subdomain: string; url: string }, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(z.object({ subdomain: subdomainSchema }), { subdomain });
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { data: previous } = await supabase.from("sites").select("subdomain").eq("id", requireId(siteId)).maybeSingle();
    const { error } = await supabase
      .from("sites")
      .update({ subdomain: parsed.data.subdomain })
      .eq("id", siteId)
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      if (postgresErrorCode(error) === "23505") {
        return fail("subdomainTaken", { subdomain: "subdomainTaken" });
      }
      return writeError(error);
    }
    updateTag(siteTags.site(siteId));
    if (previous) {
      updateTag(siteTags.key(previous.subdomain));
    }
    updateTag(siteTags.key(parsed.data.subdomain));
    const env = publicEnv();
    return ok({ subdomain: parsed.data.subdomain, url: siteUrl(parsed.data.subdomain, null, env.platformDomain, env.appUrl) });
  });
}

// -----------------------------------------------------------------------------
// Publisering, versjoner og forhåndsvisning
// -----------------------------------------------------------------------------

export async function getSitePublishState(organizationId: string, siteId: string): Promise<ActionResult<SitePublishState, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "units.sales", { allowReadOnly: true });
    const supabase = await createClient();
    return ok(await publishState(supabase, requireId(siteId)));
  });
}

/** Publiserer alle sidene, menyen, bunnteksten og temaet. Mellomlageret for siden tømmes. */
export async function publishSite(organizationId: string, siteId: string): Promise<ActionResult<SitePublishState, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { error } = await supabase.rpc("publish_site", { p_site_id: requireId(siteId) });
    if (error) {
      if (postgresErrorCode(error) === "23514") {
        return fail("needsHome");
      }
      return writeError(error);
    }
    const { data: site } = await supabase.from("sites").select("subdomain, project_id").eq("id", siteId).single();
    updateTag(siteTags.site(siteId));
    if (site) {
      updateTag(siteTags.key(site.subdomain));
      updateTag(siteTags.project(site.project_id));
    }
    return ok(await publishState(supabase, siteId));
  });
}

export async function unpublishSite(organizationId: string, siteId: string): Promise<ActionResult<SitePublishState, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { error } = await supabase.rpc("unpublish_site", { p_site_id: requireId(siteId) });
    if (error) {
      return writeError(error);
    }
    const { data: site } = await supabase.from("sites").select("subdomain").eq("id", siteId).single();
    updateTag(siteTags.site(siteId));
    if (site) {
      updateTag(siteTags.key(site.subdomain));
    }
    return ok(await publishState(supabase, siteId));
  });
}

export type PageVersion = { id: string; version: number; createdAt: string; createdBy: string | null; blockCount: number };

export async function listPageVersions(organizationId: string, pageId: string): Promise<ActionResult<PageVersion[], SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit", { allowReadOnly: true });
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("page_versions")
      .select("id, version, created_at, created_by, blocks")
      .eq("page_id", requireId(pageId))
      .eq("organization_id", organizationId)
      .order("version", { ascending: false })
      .limit(50);
    if (error) {
      return writeError(error);
    }
    const userIds = [...new Set(data.flatMap((row) => (row.created_by ? [row.created_by] : [])))];
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, full_name, email").in("id", userIds)
      : { data: [] as { id: string; full_name: string | null; email: string | null }[] };
    const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name || profile.email]));
    return ok(
      data.map((row) => ({
        id: row.id,
        version: row.version,
        createdAt: row.created_at,
        createdBy: row.created_by ? (names.get(row.created_by) ?? null) : null,
        blockCount: Array.isArray(row.blocks) ? row.blocks.length : 0,
      })),
    );
  });
}

export type RestoredPage = {
  pageId: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogAssetId: string | null;
  blocks: Block[];
  /** Filene blokkene bruker, så editoren kan vise dem. */
  assets: MediaAsset[];
};

/** Gjenoppretter en publisert versjon til utkastet. Svarer med siden slik utkastet er etterpå. */
export async function restorePageVersion(organizationId: string, versionId: string): Promise<ActionResult<RestoredPage, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { error } = await supabase.rpc("restore_page_version", { p_version_id: requireId(versionId) });
    if (error) {
      return writeError(error);
    }
    const { data: version } = await supabase.from("page_versions").select("page_id").eq("id", versionId).single();
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, title, seo_title, seo_description, og_asset_id, draft_blocks")
      .eq("id", version?.page_id ?? "")
      .single();
    if (pageError) {
      return writeError(pageError);
    }
    const blocks = parseBlocks(page.draft_blocks);
    const assetIds = [...new Set([...blocks.flatMap(blockAssetIds), page.og_asset_id])].filter((id): id is string => typeof id === "string");
    return ok({
      pageId: page.id,
      title: page.title,
      seoTitle: page.seo_title,
      seoDescription: page.seo_description,
      ogAssetId: page.og_asset_id,
      blocks,
      assets: await getAssetsByIds(organizationId, assetIds),
    });
  });
}

/** Lenke til utkastet som kan deles uten innlogging, signert og gyldig i sju dager. */
export async function createPreviewLink(organizationId: string, siteId: string): Promise<ActionResult<{ url: string; expiresAt: string }, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { data: site, error } = await supabase.from("sites").select("id").eq("id", requireId(siteId)).eq("organization_id", organizationId).maybeSingle();
    if (error) {
      return writeError(error);
    }
    if (!site) {
      return fail("notFound");
    }
    const { token, expiresAt } = createPreviewToken(site.id);
    return ok({ url: appUrl(`/preview/${token}`), expiresAt: expiresAt.toISOString() });
  });
}

// -----------------------------------------------------------------------------
// Merkevareprofil (organisasjon)
// -----------------------------------------------------------------------------

const brandSchema = themeSchema.omit({ logo_asset_id: true }).extend({
  logoAssetId: z.uuid({ error: "optionInvalid" }).nullable(),
});

export type BrandInput = z.input<typeof brandSchema>;

/** Farger, skrift, knappestil og logo for alle prosjektsider i organisasjonen. */
export async function updateBrand(organizationId: string, input: BrandInput): Promise<ActionResult<undefined, SiteError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "organization.update");
    const parsed = parseInput(brandSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const { logoAssetId, ...brand } = parsed.data;
    const supabase = await createClient();
    const { error } = await supabase
      .from("organizations")
      .update({ brand, logo_asset_id: logoAssetId })
      .eq("id", organizationId)
      .select("id")
      .single();
    if (error) {
      return writeError(error);
    }
    // Merkevaren leses direkte på publiserte sider. Tøm mellomlageret for organisasjonens sider.
    const { data: sites } = await supabase.from("sites").select("id, subdomain").eq("organization_id", organizationId);
    for (const site of sites ?? []) {
      updateTag(siteTags.site(site.id));
      updateTag(siteTags.key(site.subdomain));
    }
    return ok();
  });
}
