/**
 * Demodata: «Demo Bolig AS» med prosjektet «Fjordparken» (se src/features/demo).
 *
 *   DEMO_PASSWORD=… npm run demo           lager brukeren demo@example.com og demo-organisasjonen
 *   npm run demo -- --email kari@firma.no   gir en bruker som finnes, demo-organisasjonen
 *   npm run demo -- --replace               sletter brukerens demo-organisasjon og lager den på nytt
 *
 * Leser NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY og SUPABASE_SECRET_KEY fra
 * miljøet eller .env.local. Service-nøkkelen brukes bare til å finne eller lage brukeren og logge inn
 * som den, til å slette en gammel demo (organisasjoner kan ikke slettes i appen), til å lansere
 * prosjektet uten oppstartsavgift (som en avtale) og til leadene, som legges inn slik
 * interesseskjemaet gjør. Alt annet gjøres som brukeren, gjennom RLS og de samme
 * databasefunksjonene som appen bruker. Skriptet skriver aldri ut nøkler eller passord.
 */
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

import {
  DEMO_BRAND,
  DEMO_BUILDING,
  DEMO_FAQ,
  DEMO_LEADS,
  DEMO_ORGANIZATION,
  DEMO_PROJECT,
  DEMO_STAGE,
  DEMO_STATUS_CHANGES,
  FACADE,
  FACADE_ALT,
  demoHotspots,
  demoUnits,
  demoViewings,
  facadeSvg,
} from "@/features/demo/fjordparken";
import { CURRENT_CONSENT_VERSION } from "@/features/leads/consent";
import { originalPath, variantPath } from "@/features/media/model";
import { processImage } from "@/features/media/process";
import { DEFAULT_SELECTOR_SETTINGS } from "@/features/selector/model";
import type { Block } from "@/features/site-builder/blocks";
import { buildTemplate, type TemplateText } from "@/features/site-builder/templates";
import type { Database, Json } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

class DemoError extends Error {}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new DemoError(`${name} mangler. Sett den i miljøet eller i .env.local.`);
  }
  return value;
}

/** Stopper ved feil fra Supabase, med en melding uten nøkler eller persondata. */
function must<T>(result: { data: T; error: { message: string; code?: string } | null }, what: string): NonNullable<T> {
  if (result.error || result.data === null || result.data === undefined) {
    throw new DemoError(`${what} feilet: ${result.error?.message ?? "fikk ikke noe svar"}`);
  }
  return result.data as NonNullable<T>;
}

function check(result: { error: { message: string } | null }, what: string): void {
  if (result.error) {
    throw new DemoError(`${what} feilet: ${result.error.message}`);
  }
}

const json = (value: object) => value as NonNullable<Json>;

async function ensureUser(admin: Client, email: string, password: string | undefined): Promise<void> {
  const existing = must(await admin.from("profiles").select("id").eq("email", email).limit(1), "Oppslag av brukeren");
  const user = existing[0];
  if (user) {
    if (password) {
      check(await admin.auth.admin.updateUserById(user.id, { password }), "Endring av passordet");
    }
    return;
  }
  if (!password) {
    throw new DemoError(
      `Brukeren ${email} finnes ikke. Sett DEMO_PASSWORD for å lage den, eller bruk --email med en bruker som finnes.`,
    );
  }
  check(
    await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: "Demo Eier" } }),
    "Oppretting av brukeren",
  );
}

/** Logger inn som brukeren: med passord når det er kjent, ellers med en engangslenke laget med service-nøkkelen. */
async function signIn(admin: Client, client: Client, email: string, password: string | undefined): Promise<void> {
  if (password) {
    check(await client.auth.signInWithPassword({ email, password }), "Innloggingen");
    return;
  }
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (link.error) {
    throw new DemoError(`Engangslenken feilet: ${link.error.message}`);
  }
  check(await client.auth.verifyOtp({ type: "magiclink", token_hash: link.data.properties.hashed_token }), "Innloggingen");
}

/**
 * Sletter brukerens gamle demo-organisasjon, og deretter filene i Storage. Feiler
 * slettingen, beholdes filene, så organisasjonen ikke står igjen uten bilder.
 */
async function removeOrganization(admin: Client, organizationId: string): Promise<void> {
  const assets = must(
    await admin.from("assets").select("storage_path, variants").eq("organization_id", organizationId),
    "Oppslag av filene",
  );
  const paths = assets.flatMap((asset) => [
    asset.storage_path,
    ...(Array.isArray(asset.variants)
      ? asset.variants.flatMap((variant) =>
          typeof variant === "object" && variant !== null && "path" in variant && typeof variant.path === "string"
            ? [variant.path]
            : [],
        )
      : []),
  ]);
  check(await admin.from("organizations").delete().eq("id", organizationId), "Sletting av organisasjonen");
  if (paths.length > 0) {
    check(await admin.storage.from("media").remove(paths), "Sletting av filene");
  }
}

async function createOrganization(client: Client): Promise<{ id: string; slug: string }> {
  // Først «demo-bolig», deretter med tilfeldig endelse hvis adressen er i bruk.
  for (let attempt = 1; attempt <= 6; attempt++) {
    const slug = attempt === 1 ? DEMO_ORGANIZATION.slug : `${DEMO_ORGANIZATION.slug}-${randomUUID().slice(0, 6)}`;
    const result = await client.rpc("create_organization", { p_name: DEMO_ORGANIZATION.name, p_slug: slug });
    if (!result.error) {
      return { id: result.data, slug };
    }
    if (result.error.code !== "23505") {
      throw new DemoError(`Oppretting av organisasjonen feilet: ${result.error.message}`);
    }
  }
  throw new DemoError("Fant ingen ledig adresse for organisasjonen");
}

/** Fasaden som PNG i full størrelse, og WebP-variantene appen lager ved opplasting. */
async function uploadFacade(client: Client, organizationId: string, projectId: string): Promise<string> {
  const png = await sharp(Buffer.from(facadeSvg())).png().toBuffer();
  const mime = "image/png";
  const assetId = randomUUID();
  const storage = client.storage.from("media");
  const path = originalPath(organizationId, assetId, mime);
  check(await storage.upload(path, png, { contentType: mime, cacheControl: "31536000" }), "Opplasting av fasaden");
  const processed = await processImage(png, mime);
  const variants = [];
  for (const variant of processed.variants) {
    const variantFile = variantPath(organizationId, assetId, variant.width);
    check(
      await storage.upload(variantFile, variant.data, { contentType: "image/webp", cacheControl: "31536000", upsert: true }),
      "Opplasting av en bildevariant",
    );
    variants.push({ width: variant.width, height: variant.height, path: variantFile, bytes: variant.data.byteLength });
  }
  check(
    await client.from("assets").insert({
      id: assetId,
      organization_id: organizationId,
      project_id: projectId,
      storage_path: path,
      mime,
      bytes: png.byteLength,
      filename: "fjordparken-fasade.png",
      alt_text: FACADE_ALT,
      width: processed.width,
      height: processed.height,
      variants: json(variants),
      processing_status: "ready",
    }),
    "Lagring av fasaden i mediebiblioteket",
  );
  return assetId;
}

function siteBlocks(blocks: Block[], facadeId: string): Block[] {
  return blocks.flatMap((block): Block[] => {
    switch (block.type) {
      case "hero":
        return [{ ...block, props: { ...block.props, image_asset_id: facadeId } }];
      case "viewings":
        return [{ ...block, props: { ...block.props, items: demoViewings(new Date()) } }];
      case "faq":
        return [{ ...block, props: { ...block.props, items: [...DEMO_FAQ] } }];
      // Demoen har ingen bilder til galleriet og ingen dokumenter.
      case "gallery":
      case "documents":
        return [];
      default:
        return [block];
    }
  });
}

async function createSite(
  client: Client,
  project: { id: string; name: string; description: string },
  selectorId: string,
  facadeId: string,
): Promise<{ siteId: string; subdomain: string; homePageId: string }> {
  const messages = JSON.parse(readFileSync("messages/nb.json", "utf8")) as { siteBuilder: { templates: Record<TemplateText, string> } };
  const texts = messages.siteBuilder.templates;
  const template = buildTemplate("full", {
    projectName: project.name,
    description: project.description,
    selectorId,
    t: (key) => texts[key],
  });
  const pages = template.pages.map((page) => ({ ...page, blocks: siteBlocks(page.blocks, facadeId) }));
  for (const subdomain of ["fjordparken", "fjordparken-demo", `fjordparken-${randomUUID().slice(0, 6)}`]) {
    const result = await client.rpc("create_site", {
      p_project_id: project.id,
      p_subdomain: subdomain,
      p_site: json({ nav: template.nav, footer: template.footer, seo_defaults: template.seo_defaults, theme: {} }),
      p_pages: json(pages),
    });
    if (!result.error) {
      return { siteId: result.data, subdomain, homePageId: template.pages[0]?.id ?? "" };
    }
    if (result.error.code !== "23505") {
      throw new DemoError(`Oppretting av prosjektsiden feilet: ${result.error.message}`);
    }
  }
  throw new DemoError("Fant ingen ledig adresse for prosjektsiden");
}

async function main() {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const { values } = parseArgs({
    options: { email: { type: "string" }, replace: { type: "boolean", default: false } },
  });
  const email = (values.email ?? process.env.DEMO_EMAIL ?? "demo@example.com").trim().toLowerCase();
  const password = process.env.DEMO_PASSWORD || undefined;
  const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const admin = createClient<Database>(supabaseUrl, required("SUPABASE_SECRET_KEY"), options);
  const client = createClient<Database>(supabaseUrl, required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), options);

  await ensureUser(admin, email, password);
  await signIn(admin, client, email, password);

  const existing = must(
    await client.from("organizations").select("id, slug").eq("name", DEMO_ORGANIZATION.name),
    "Oppslag av organisasjonene",
  );
  if (existing.length > 0) {
    if (!values.replace) {
      console.info(`${email} har allerede ${DEMO_ORGANIZATION.name} (/${existing[0]?.slug}). Bruk --replace for å lage den på nytt.`);
      return;
    }
    for (const organization of existing) {
      await removeOrganization(admin, organization.id);
    }
  }

  // Organisasjon og merkevareprofil
  const organization = await createOrganization(client);
  check(await client.from("organizations").update({ brand: json(DEMO_BRAND) }).eq("id", organization.id), "Merkevareprofilen");

  // Prosjekt med byggetrinn og bygg
  const project = must(
    await client.rpc("create_project", {
      p_organization_id: organization.id,
      p_project: json(DEMO_PROJECT),
      p_stages: json([{ name: DEMO_STAGE, buildings: [DEMO_BUILDING] }]),
    }),
    "Oppretting av prosjektet",
  ) as { id: string; slug: string };

  // 24 leiligheter. Noen får ny status etterpå, så statusloggen har innhold.
  const changed = new Set(DEMO_STATUS_CHANGES.map((change) => change.unitNumber));
  const rows = demoUnits().map((unit) => (changed.has(unit.unit_number) ? { ...unit, status: "available" as const } : unit));
  must(
    await client.rpc("import_units", { p_project_id: project.id, p_rows: json(rows), p_columns: Object.keys(rows[0] ?? {}) }),
    "Importen av enhetene",
  );
  const units = must(await client.from("units").select("id, unit_number").eq("project_id", project.id), "Oppslag av enhetene");
  const unitIds = new Map(units.map((unit) => [unit.unit_number, unit.id]));
  for (const change of DEMO_STATUS_CHANGES) {
    const unitId = unitIds.get(change.unitNumber);
    if (unitId) {
      must(
        await client.rpc("set_unit_status", { p_unit_ids: [unitId], p_status: change.status, p_note: change.note, p_source: "table" }),
        "Statusendringen",
      );
    }
  }

  // Fasaden og boligvelgeren med en markering per leilighet
  const facadeId = await uploadFacade(client, organization.id, project.id);
  const selectorId = randomUUID();
  const viewId = randomUUID();
  check(
    await client.from("selectors").insert({
      id: selectorId,
      organization_id: organization.id,
      project_id: project.id,
      name: "Boligvelger",
      settings: json(DEFAULT_SELECTOR_SETTINGS),
    }),
    "Oppretting av boligvelgeren",
  );
  check(
    await client.from("selector_views").insert({
      id: viewId,
      organization_id: organization.id,
      project_id: project.id,
      selector_id: selectorId,
      name: "Fasade",
      kind: "facade",
      asset_id: facadeId,
      image_width: FACADE.width,
      image_height: FACADE.height,
    }),
    "Oppretting av visningen",
  );
  check(await client.from("selectors").update({ entry_view_id: viewId }).eq("id", selectorId), "Startvisningen");
  const hotspots = demoHotspots().map((hotspot) => ({
    id: randomUUID(),
    shape: "rect",
    points: hotspot.points,
    target_type: "unit",
    target_unit_id: unitIds.get(hotspot.unitNumber) ?? null,
    target_view_id: null,
    target_project_id: null,
    target_url: null,
    label: null,
  }));
  must(await client.rpc("save_view_hotspots", { p_view_id: viewId, p_hotspots: json(hotspots) }), "Lagring av markeringene");

  // Et prosjekt publiseres først når det er lansert. Demoen lanseres uten oppstartsavgift, som en avtale.
  check(await admin.rpc("waive_project_launch", { p_project_id: project.id, p_note: "Demodata" }), "Lansering av prosjektet");
  must(await client.rpc("publish_selector", { p_selector_id: selectorId }), "Publisering av boligvelgeren");

  // Prosjektsiden fra malen «Full prosjektside», med personvernopplysninger, publisert
  const site = await createSite(client, { id: project.id, ...DEMO_PROJECT }, selectorId, facadeId);
  check(
    await client
      .from("sites")
      .update({ cookie_settings: json({ controller: DEMO_ORGANIZATION.name, email: "personvern@demobolig.example" }) })
      .eq("id", site.siteId),
    "Personvernopplysningene",
  );
  must(await client.rpc("publish_site", { p_site_id: site.siteId }), "Publisering av prosjektsiden");

  // Leads, lagt inn slik interesseskjemaet gjør
  for (const lead of DEMO_LEADS) {
    must(
      await admin.rpc("submit_lead", {
        p_lead: json({
          project_id: project.id,
          unit_id: lead.unitNumber ? (unitIds.get(lead.unitNumber) ?? null) : null,
          page_id: site.homePageId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          message: lead.message,
          consent_contact: true,
          consent_similar_projects: lead.consentSimilar,
          consent_text_version: CURRENT_CONSENT_VERSION,
          source: "site",
          utm: {},
        }),
      }),
      "Innleggingen av leads",
    );
  }

  await client.auth.signOut();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "localhost:3000";
  const protocol = appUrl.startsWith("http://") ? "http" : "https";
  console.info(
    [
      `${DEMO_ORGANIZATION.name} er klar.`,
      `  Admin:        ${new URL(`/${organization.slug}/projects/${project.slug}`, appUrl).toString()}`,
      `  Prosjektside: ${protocol}://${site.subdomain}.${platformDomain}`,
      `  Innlogging:   ${email}`,
    ].join("\n"),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof DemoError ? error.message : error);
  process.exitCode = 1;
});
