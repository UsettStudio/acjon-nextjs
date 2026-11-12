/**
 * Blokkene på en prosjektside. En blokk lagres som
 *   { id, type, hidden, props }
 * i pages.draft_blocks (utkast) og pages.published_blocks (publisert).
 * Skjulte blokker beholder innholdet i utkastet, men publiseres ikke.
 *
 * Skjemaene har standardverdier for alle felt. Da tåler lagrede blokker at
 * nye felt kommer til senere, og en blokk som mangler et felt, får standardverdien.
 * Feilmeldingene er nøkler under «validation».
 */

import { z } from "zod";

export const BLOCK_TYPES = [
  "hero",
  "text",
  "text_image",
  "gallery",
  "key_figures",
  "progress",
  "selector",
  "unit_list",
  "map",
  "viewings",
  "contacts",
  "lead_form",
  "documents",
  "video",
  "faq",
  "news",
  "button",
  "embed",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

const text = (max: number) => z.string().max(max, { error: "textTooLong" }).default("");
const assetId = z.uuid({ error: "optionInvalid" });
const optionalAssetId = z.uuid({ error: "optionInvalid" }).nullable().default(null);
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "dateInvalid" });
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "timeInvalid" });

/** Lenke fra en knapp eller menyen: en side, en blokk på siden, eller en adresse. */
export const linkSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("page"), page_id: z.uuid({ error: "optionInvalid" }) }),
  z.object({ type: z.literal("block"), block_id: z.string().min(1).max(64) }),
  z.object({
    type: z.literal("url"),
    url: z
      .string()
      .trim()
      .max(2048, { error: "textTooLong" })
      .regex(/^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+0-9 ()-]+)$/i, { error: "urlInvalid" }),
  }),
]);

export type SiteLink = z.infer<typeof linkSchema>;

const optionalLink = linkSchema.nullable().default(null);

/** Nettadresse som kan bygges inn. Bare https, så siden aldri laster usikkert innhold. */
const httpsUrl = z
  .string()
  .trim()
  .max(2048, { error: "textTooLong" })
  .refine((value) => value === "" || /^https:\/\/[^\s]+$/i.test(value), { error: "httpsRequired" })
  .default("");

export const KEY_FIGURE_SOURCES = ["custom", "units_total", "available", "size_range", "price_from", "rooms_range"] as const;
export type KeyFigureSource = (typeof KEY_FIGURE_SOURCES)[number];

export const blockPropsSchemas = {
  hero: z.object({
    title: text(200),
    subtitle: text(500),
    image_asset_id: optionalAssetId,
    overlay: z.number().int().min(0).max(80).default(35),
    height: z.enum(["medium", "large", "full"]).default("large"),
    align: z.enum(["left", "center"]).default("left"),
    cta_label: text(80),
    cta_link: optionalLink,
  }),
  text: z.object({
    heading: text(200),
    body: text(10000),
    width: z.enum(["narrow", "wide"]).default("narrow"),
  }),
  text_image: z.object({
    heading: text(200),
    body: text(10000),
    image_asset_id: optionalAssetId,
    image_position: z.enum(["left", "right"]).default("right"),
  }),
  gallery: z.object({
    heading: text(200),
    asset_ids: z.array(assetId).max(60).default([]),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  }),
  key_figures: z.object({
    heading: text(200),
    items: z
      .array(
        z.object({
          source: z.enum(KEY_FIGURE_SOURCES).default("custom"),
          value: text(40),
          label: text(80),
        }),
      )
      .max(8)
      .default([]),
  }),
  progress: z.object({
    heading: text(200),
    use_project: z.boolean().default(true),
    items: z
      .array(z.object({ label: text(100), text: text(100), done: z.boolean().default(false) }))
      .max(12)
      .default([]),
  }),
  selector: z.object({
    heading: text(200),
    selector_id: z.uuid({ error: "optionInvalid" }).nullable().default(null),
    entry_view_id: z.uuid({ error: "optionInvalid" }).nullable().default(null),
    show_filters: z.boolean().default(true),
    show_list: z.boolean().default(true),
  }),
  unit_list: z.object({
    heading: text(200),
    show_filters: z.boolean().default(true),
    hide_sold: z.boolean().default(false),
  }),
  map: z.object({
    heading: text(200),
    use_project_location: z.boolean().default(true),
    lat: z.number().min(-90).max(90).nullable().default(null),
    lng: z.number().min(-180).max(180).nullable().default(null),
    zoom: z.number().int().min(8).max(18).default(14),
    places: z
      .array(z.object({ name: text(100), category: text(60), distance: text(40) }))
      .max(30)
      .default([]),
  }),
  viewings: z.object({
    heading: text(200),
    intro: text(1000),
    items: z
      .array(
        z.object({
          date: dateString,
          start: timeString,
          end: timeString.or(z.literal("")).default(""),
          note: text(200),
        }),
      )
      .max(20)
      .default([]),
  }),
  contacts: z.object({
    heading: text(200),
    use_project: z.boolean().default(true),
    items: z
      .array(
        z.object({
          name: text(100),
          title: text(100),
          phone: text(40),
          email: text(320),
          image_asset_id: optionalAssetId,
        }),
      )
      .max(12)
      .default([]),
  }),
  lead_form: z.object({
    heading: text(200),
    intro: text(1000),
    button_label: text(60),
    show_unit_select: z.boolean().default(true),
  }),
  documents: z.object({
    heading: text(200),
    asset_ids: z.array(assetId).max(40).default([]),
  }),
  video: z.object({
    heading: text(200),
    url: z
      .string()
      .trim()
      .max(2048, { error: "textTooLong" })
      .refine((value) => value === "" || parseVideoUrl(value) !== null, { error: "videoInvalid" })
      .default(""),
    caption: text(300),
  }),
  faq: z.object({
    heading: text(200),
    items: z
      .array(z.object({ question: text(300), answer: text(3000) }))
      .max(40)
      .default([]),
  }),
  news: z.object({
    heading: text(200),
    items: z
      .array(
        z.object({
          id: z.string().min(1).max(64),
          date: dateString.or(z.literal("")).default(""),
          title: text(200),
          body: text(5000),
          image_asset_id: optionalAssetId,
        }),
      )
      .max(30)
      .default([]),
  }),
  button: z.object({
    label: text(80),
    link: optionalLink,
    style: z.enum(["primary", "secondary"]).default("primary"),
    align: z.enum(["left", "center", "right"]).default("center"),
  }),
  embed: z.object({
    heading: text(200),
    url: httpsUrl,
    title: text(200),
    height: z.number().int().min(200).max(1200).default(600),
  }),
} satisfies Record<BlockType, z.ZodType>;

export type BlockProps<T extends BlockType> = z.output<(typeof blockPropsSchemas)[T]>;

const blockBase = {
  id: z.string().min(1).max(64),
  hidden: z.boolean().default(false),
};

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ ...blockBase, type: z.literal("hero"), props: blockPropsSchemas.hero.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("text"), props: blockPropsSchemas.text.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("text_image"), props: blockPropsSchemas.text_image.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("gallery"), props: blockPropsSchemas.gallery.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("key_figures"), props: blockPropsSchemas.key_figures.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("progress"), props: blockPropsSchemas.progress.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("selector"), props: blockPropsSchemas.selector.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("unit_list"), props: blockPropsSchemas.unit_list.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("map"), props: blockPropsSchemas.map.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("viewings"), props: blockPropsSchemas.viewings.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("contacts"), props: blockPropsSchemas.contacts.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("lead_form"), props: blockPropsSchemas.lead_form.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("documents"), props: blockPropsSchemas.documents.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("video"), props: blockPropsSchemas.video.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("faq"), props: blockPropsSchemas.faq.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("news"), props: blockPropsSchemas.news.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("button"), props: blockPropsSchemas.button.prefault({}) }),
  z.object({ ...blockBase, type: z.literal("embed"), props: blockPropsSchemas.embed.prefault({}) }),
]);

export type Block = z.output<typeof blockSchema>;
export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;

/** Alle blokkene på en side, slik de lagres. Id-ene må være unike. */
export const blocksSchema = z
  .array(blockSchema)
  .max(100)
  .superRefine((blocks, ctx) => {
    const seen = new Set<string>();
    for (const [index, block] of blocks.entries()) {
      if (seen.has(block.id)) {
        ctx.addIssue({ code: "custom", path: [index, "id"], message: "optionInvalid" });
      }
      seen.add(block.id);
    }
  });

/**
 * Blokker fra databasen. Ugyldige blokker og ukjente typer hoppes over, så en
 * enkelt feil aldri stopper hele siden.
 */
export function parseBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set<string>();
  return value.flatMap((item) => {
    const parsed = blockSchema.safeParse(item);
    if (!parsed.success || seen.has(parsed.data.id)) {
      return [];
    }
    seen.add(parsed.data.id);
    return [parsed.data];
  });
}

/** Ny blokk med standardverdier. Id-en er kort og unik nok innenfor en side. */
export function createBlock<T extends BlockType>(type: T, props: Partial<BlockProps<T>> = {}, id = newBlockId()): BlockOf<T> {
  return blockSchema.parse({ id, type, hidden: false, props }) as BlockOf<T>;
}

export function newBlockId(): string {
  return `b${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

/** Kopi med ny id (og nye id-er på nyhetssaker). */
export function duplicateBlock(block: Block): Block {
  const copy = structuredClone(block);
  copy.id = newBlockId();
  if (copy.type === "news") {
    copy.props.items = copy.props.items.map((item) => ({ ...item, id: newBlockId() }));
  }
  return copy;
}

/** Filene en blokk bruker (bilder og dokumenter), så de kan hentes samlet. */
export function blockAssetIds(block: Block): string[] {
  switch (block.type) {
    case "hero":
    case "text_image":
      return block.props.image_asset_id ? [block.props.image_asset_id] : [];
    case "gallery":
    case "documents":
      return block.props.asset_ids;
    case "contacts":
      return block.props.items.flatMap((item) => (item.image_asset_id ? [item.image_asset_id] : []));
    case "news":
      return block.props.items.flatMap((item) => (item.image_asset_id ? [item.image_asset_id] : []));
    default:
      return [];
  }
}

// -----------------------------------------------------------------------------
// Video: YouTube og Vimeo, uten sporing før besøkeren selv starter videoen
// -----------------------------------------------------------------------------

export type VideoSource = { provider: "youtube" | "vimeo"; id: string; embedUrl: string };

export function parseVideoUrl(value: string): VideoSource | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  let youtubeId: string | null = null;
  if (host === "youtu.be") {
    youtubeId = url.pathname.slice(1).split("/")[0] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      youtubeId = url.searchParams.get("v");
    } else {
      const match = /^\/(embed|shorts|live)\/([^/?#]+)/.exec(url.pathname);
      youtubeId = match?.[2] ?? null;
    }
  }
  if (youtubeId && /^[A-Za-z0-9_-]{6,20}$/.test(youtubeId)) {
    return { provider: "youtube", id: youtubeId, embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0` };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match = /^\/(?:video\/)?(\d{5,12})/.exec(url.pathname);
    if (match?.[1]) {
      return { provider: "vimeo", id: match[1], embedUrl: `https://player.vimeo.com/video/${match[1]}?autoplay=1&dnt=1` };
    }
  }
  return null;
}
