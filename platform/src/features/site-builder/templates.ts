/**
 * Maler for nye prosjektsider. Begge malene bruker de samme blokkene, så en
 * side som starter som «Kommer for salg», kan bygges ut til full prosjektside
 * uten å begynne på nytt: expandToFull() legger til blokkene som mangler.
 */

import { createBlock, type Block, type BlockType } from "@/features/site-builder/blocks";
import type { NavItem, SiteFooter } from "@/features/site-builder/site";

export const TEMPLATE_KINDS = ["coming_soon", "full"] as const;
export type TemplateKind = (typeof TEMPLATE_KINDS)[number];

/** Tekstene i malene, på organisasjonens språk (nøkler under siteBuilder.templates). */
export type TemplateText =
  | "homeTitle"
  | "heroSubtitleComingSoon"
  | "heroSubtitleFull"
  | "heroCta"
  | "aboutHeading"
  | "aboutBody"
  | "leadHeading"
  | "leadIntro"
  | "leadButton"
  | "keyFiguresHeading"
  | "selectorHeading"
  | "unitsHeading"
  | "galleryHeading"
  | "progressHeading"
  | "mapHeading"
  | "viewingsHeading"
  | "viewingsIntro"
  | "documentsHeading"
  | "faqHeading"
  | "contactsHeading"
  | "navUnits"
  | "navContact";

export type TemplateContext = {
  projectName: string;
  description: string | null;
  /** Første boligvelger i prosjektet, hvis det finnes en. */
  selectorId: string | null;
  t: (key: TemplateText) => string;
};

export const COMING_SOON_BLOCKS: BlockType[] = ["hero", "text", "lead_form"];

export const FULL_BLOCKS: BlockType[] = [
  "hero",
  "key_figures",
  "text_image",
  "selector",
  "gallery",
  "progress",
  "map",
  "viewings",
  "documents",
  "faq",
  "contacts",
  "lead_form",
];

/** Standardinnholdet til en blokktype i malene. */
export function templateBlock(type: BlockType, ctx: TemplateContext, ids: { leadFormId: string }, kind: TemplateKind): Block {
  const { t } = ctx;
  const about = ctx.description?.trim() || t("aboutBody");
  switch (type) {
    case "hero":
      return createBlock("hero", {
        title: ctx.projectName,
        subtitle: kind === "coming_soon" ? t("heroSubtitleComingSoon") : t("heroSubtitleFull"),
        cta_label: t("heroCta"),
        cta_link: { type: "block", block_id: ids.leadFormId },
      });
    case "text":
      return createBlock("text", { heading: t("aboutHeading"), body: about });
    case "text_image":
      return createBlock("text_image", { heading: t("aboutHeading"), body: about });
    case "lead_form":
      return createBlock(
        "lead_form",
        { heading: t("leadHeading"), intro: t("leadIntro"), button_label: t("leadButton") },
        ids.leadFormId,
      );
    case "key_figures":
      return createBlock("key_figures", {
        heading: t("keyFiguresHeading"),
        items: [
          { source: "units_total", value: "", label: "" },
          { source: "available", value: "", label: "" },
          { source: "size_range", value: "", label: "" },
          { source: "price_from", value: "", label: "" },
        ],
      });
    case "selector":
      return createBlock("selector", { heading: t("selectorHeading"), selector_id: ctx.selectorId });
    case "unit_list":
      return createBlock("unit_list", { heading: t("unitsHeading") });
    case "gallery":
      return createBlock("gallery", { heading: t("galleryHeading") });
    case "progress":
      return createBlock("progress", { heading: t("progressHeading") });
    case "map":
      return createBlock("map", { heading: t("mapHeading") });
    case "viewings":
      return createBlock("viewings", { heading: t("viewingsHeading"), intro: t("viewingsIntro") });
    case "documents":
      return createBlock("documents", { heading: t("documentsHeading") });
    case "faq":
      return createBlock("faq", { heading: t("faqHeading") });
    case "contacts":
      return createBlock("contacts", { heading: t("contactsHeading") });
    default:
      return createBlock(type);
  }
}

export type TemplatePage = { id: string; title: string; slug: string; is_home: boolean; blocks: Block[] };

export type SiteTemplate = {
  pages: TemplatePage[];
  nav: NavItem[];
  footer: SiteFooter;
  seo_defaults: { description: string; og_asset_id: null };
};

export function buildTemplate(kind: TemplateKind, ctx: TemplateContext, homePageId: string = crypto.randomUUID()): SiteTemplate {
  const leadFormId = "interesse";
  const types = kind === "coming_soon" ? COMING_SOON_BLOCKS : FULL_BLOCKS;
  const blocks = types.map((type) => templateBlock(type, ctx, { leadFormId }, kind));
  // Uten boligvelger i prosjektet viser malen enhetslisten i stedet.
  if (kind === "full" && !ctx.selectorId) {
    const index = blocks.findIndex((block) => block.type === "selector");
    if (index !== -1) {
      blocks.splice(index, 1, templateBlock("unit_list", ctx, { leadFormId }, kind));
    }
  }
  const unitsBlock = blocks.find((block) => block.type === "selector") ?? blocks.find((block) => block.type === "unit_list");
  const nav: NavItem[] =
    kind === "full"
      ? [
          ...(unitsBlock ? [{ id: "nav-boliger", label: ctx.t("navUnits"), link: { type: "block" as const, block_id: unitsBlock.id } }] : []),
          { id: "nav-kontakt", label: ctx.t("navContact"), link: { type: "block" as const, block_id: leadFormId } },
        ]
      : [];
  const description = (ctx.description ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
  return {
    pages: [{ id: homePageId, title: ctx.t("homeTitle"), slug: "forside", is_home: true, blocks }],
    nav,
    footer: { text: "", show_contacts: true, links: [] },
    seo_defaults: { description, og_asset_id: null },
  };
}

/**
 * Bygger ut en side til full prosjektside: blokktypene fra den fulle malen som
 * mangler, settes inn i malens rekkefølge. Blokker som finnes, beholdes uendret,
 * også egne blokker som ikke er i malen.
 */
export function expandToFull(input: Block[], ctx: TemplateContext): Block[] {
  let blocks = input;
  const present = new Set(blocks.map((block) => block.type));
  // «Tekst» fra «Kommer for salg» dekker «Om prosjektet», så tekst og bilde legges ikke til i tillegg.
  if (present.has("text")) {
    present.add("text_image");
  }
  // En enhetsliste dekker boligene når prosjektet ikke har boligvelger.
  if (!ctx.selectorId) {
    present.add("selector");
    if (!present.has("unit_list")) {
      const index = FULL_BLOCKS.indexOf("selector");
      const block = templateBlock("unit_list", ctx, { leadFormId: blocks.find((item) => item.type === "lead_form")?.id ?? "interesse" }, "full");
      const later = new Set(FULL_BLOCKS.slice(index + 1));
      const position = blocks.findIndex((existing) => later.has(existing.type));
      blocks = position === -1 ? [...blocks, block] : [...blocks.slice(0, position), block, ...blocks.slice(position)];
      present.add("unit_list");
    }
  }
  const leadForm = blocks.find((block) => block.type === "lead_form");
  const leadFormId = leadForm?.id ?? "interesse";
  const result = [...blocks];
  for (const [index, type] of FULL_BLOCKS.entries()) {
    if (present.has(type)) {
      continue;
    }
    const block = templateBlock(type, ctx, { leadFormId }, "full");
    // Sett inn før første blokk som kommer senere i malen, ellers til slutt.
    const later = new Set(FULL_BLOCKS.slice(index + 1));
    const position = result.findIndex((existing) => later.has(existing.type));
    if (position === -1) {
      result.push(block);
    } else {
      result.splice(position, 0, block);
    }
    present.add(type);
  }
  return result;
}

/** Blokktypene expandToFull vil legge til. Tom liste når siden allerede er en full prosjektside. */
export function missingForFull(blocks: Block[], hasSelector: boolean): BlockType[] {
  const present = new Set(blocks.map((block) => block.type));
  if (present.has("text")) {
    present.add("text_image");
  }
  const missing: BlockType[] = [];
  if (!hasSelector) {
    present.add("selector");
    if (!present.has("unit_list")) {
      missing.push("unit_list");
    }
  }
  return [...FULL_BLOCKS.filter((type) => !present.has(type)), ...missing];
}
