import { describe, expect, it } from "vitest";

import {
  BLOCK_TYPES,
  blockAssetIds,
  blocksSchema,
  createBlock,
  duplicateBlock,
  parseBlocks,
  parseVideoUrl,
  type Block,
} from "@/features/site-builder/blocks";
import { isSafeHref, parseRichText } from "@/features/site-builder/rich-text";
import { pageHref, pageSlugSchema, parseNav, resolveLink, siteUrl, subdomainSchema } from "@/features/site-builder/site";
import { buildTemplate, COMING_SOON_BLOCKS, expandToFull, FULL_BLOCKS, type TemplateContext } from "@/features/site-builder/templates";
import {
  contrastRatio,
  DEFAULT_THEME,
  mixColors,
  primaryTextColor,
  readableTextOn,
  resolveTheme,
  SITE_STYLES,
  STYLE_DEFAULTS,
  themeStyle,
} from "@/features/site-builder/theme";

const ctx: TemplateContext = {
  projectName: "Fjordparken",
  description: "24 leiligheter ved fjorden.",
  selectorId: "00000000-0000-4000-8000-000000000001",
  t: (key) => `[${key}]`,
};

describe("blokker", () => {
  it("lager alle 18 blokktyper med gyldige standardverdier", () => {
    expect(BLOCK_TYPES).toHaveLength(18);
    const blocks = BLOCK_TYPES.map((type) => createBlock(type));
    expect(blocksSchema.safeParse(blocks).success).toBe(true);
    expect(new Set(blocks.map((block) => block.id)).size).toBe(18);
  });

  it("hopper over ugyldige og dupliserte blokker fra databasen", () => {
    const hero = createBlock("hero", { title: "Velkommen" }, "a1");
    const blocks = parseBlocks([
      hero,
      { id: "a1", type: "text", props: {} },
      { id: "x", type: "ukjent", props: {} },
      { id: "y", type: "video", props: { url: "javascript:alert(1)" } },
      "tull",
      { id: "z", type: "text", props: { body: "Hei" } },
    ]);
    expect(blocks.map((block) => block.id)).toEqual(["a1", "z"]);
  });

  it("fyller inn standardverdier for felt som mangler (eldre lagrede blokker)", () => {
    const [block] = parseBlocks([{ id: "s", type: "selector", props: { selector_id: "00000000-0000-4000-8000-000000000001" } }]);
    expect(block).toMatchObject({ type: "selector", hidden: false, props: { show_filters: true, show_list: true, heading: "" } });
  });

  it("avviser ugyldige lenker, usikre innbygginger og like id-er når siden lagres", () => {
    const button = { id: "k", type: "button", props: { label: "Gå", link: { type: "url", url: "javascript:alert(1)" } } };
    expect(blocksSchema.safeParse([button]).success).toBe(false);
    expect(() => createBlock("button", { link: { type: "url", url: "javascript:alert(1)" } })).toThrow();
    expect(blocksSchema.safeParse([{ id: "e", type: "embed", props: { url: "http://usikker.no" } }]).success).toBe(false);
    expect(blocksSchema.safeParse([{ id: "e", type: "embed", props: { url: "https://my.matterport.com/show/?m=abc" } }]).success).toBe(true);
    const text = createBlock("text", {}, "lik");
    expect(blocksSchema.safeParse([text, { ...text }]).success).toBe(false);
  });

  it("dupliserer med ny id og finner filene en blokk bruker", () => {
    const gallery = createBlock("gallery", { asset_ids: ["00000000-0000-4000-8000-0000000000a1", "00000000-0000-4000-8000-0000000000a2"] });
    const copy = duplicateBlock(gallery);
    expect(copy.id).not.toBe(gallery.id);
    expect(copy.props).toEqual(gallery.props);
    expect(blockAssetIds(copy)).toHaveLength(2);
    expect(blockAssetIds(createBlock("hero"))).toEqual([]);
  });

  it("tolker YouTube og Vimeo og bruker personvernvennlige adresser", () => {
    expect(parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")?.embedUrl).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ")?.id).toBe("dQw4w9WgXcQ");
    expect(parseVideoUrl("https://vimeo.com/123456789")?.embedUrl).toBe("https://player.vimeo.com/video/123456789?autoplay=1&dnt=1");
    expect(parseVideoUrl("http://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseVideoUrl("https://example.com/video")).toBeNull();
  });
});

describe("maler", () => {
  it("«Kommer for salg» har hero, tekst og interesseskjema", () => {
    const template = buildTemplate("coming_soon", ctx, "00000000-0000-4000-8000-0000000000b1");
    expect(template.pages).toHaveLength(1);
    expect(template.pages[0]?.blocks.map((block) => block.type)).toEqual(COMING_SOON_BLOCKS);
    expect(blocksSchema.safeParse(template.pages[0]?.blocks).success).toBe(true);
    const hero = template.pages[0]?.blocks[0];
    expect(hero?.type === "hero" && hero.props.cta_link).toEqual({ type: "block", block_id: "interesse" });
  });

  it("«Full prosjektside» kobler boligvelgeren og har meny til boliger og kontakt", () => {
    const template = buildTemplate("full", ctx);
    const blocks = template.pages[0]?.blocks ?? [];
    expect(blocks.map((block) => block.type)).toEqual(FULL_BLOCKS);
    const selector = blocks.find((block) => block.type === "selector");
    expect(selector?.type === "selector" && selector.props.selector_id).toBe(ctx.selectorId);
    expect(template.nav.map((item) => item.label)).toEqual(["[navUnits]", "[navContact]"]);
    // «Meld interesse» vises som en knapp i menyen.
    expect(template.nav.map((item) => item.button ?? false)).toEqual([false, true]);
    expect(template.seo_defaults.description).toBe("24 leiligheter ved fjorden.");
    // Hero i full høyde med salgsstatus, og overtitler over overskriftene.
    const hero = blocks[0];
    expect(hero?.type === "hero" && [hero.props.height, hero.props.align, hero.props.show_status]).toEqual(["full", "center", true]);
    for (const block of blocks.filter((item) => item.type !== "hero")) {
      expect("eyebrow" in block.props && block.props.eyebrow, block.type).toBeTruthy();
    }
    expect(blocksSchema.safeParse(blocks).success).toBe(true);
  });

  it("bygger ut «Kommer for salg» til full side uten å miste innhold", () => {
    const start = buildTemplate("coming_soon", ctx).pages[0]?.blocks ?? [];
    const edited: Block[] = start.map((block) => (block.type === "text" ? { ...block, props: { ...block.props, body: "Egen tekst" } } : block));
    const expanded = expandToFull(edited, ctx);
    const types = expanded.map((block) => block.type);
    // Alt som fantes, er med, i samme rekkefølge og med samme innhold.
    expect(expanded.filter((block) => edited.some((original) => original.id === block.id))).toEqual(edited);
    // Tekstblokken dekker «Om prosjektet», så tekst og bilde legges ikke til.
    expect(types).not.toContain("text_image");
    expect(types[0]).toBe("hero");
    expect(types[types.length - 1]).toBe("lead_form");
    expect(new Set(types)).toEqual(new Set([...FULL_BLOCKS.filter((type) => type !== "text_image"), "text"]));
    // Å bygge ut igjen endrer ingenting.
    expect(expandToFull(expanded, ctx)).toEqual(expanded);
  });
});

describe("tema", () => {
  it("arver fra merkevareprofilen og lar prosjektsiden overstyre", () => {
    const theme = resolveTheme({ primary: "#003366", heading_font: "lora" }, { primary: "#336699", button_style: "pill" });
    expect(theme).toEqual({ ...DEFAULT_THEME, primary: "#336699", heading_font: "lora", button_style: "pill" });
    expect(resolveTheme({ primary: "rød" }, null).primary).toBe(DEFAULT_THEME.primary);
  });

  it("bruker Nordisk når verken merkevaren eller siden har valgt stil", () => {
    expect(DEFAULT_THEME.style).toBe("nordic");
    expect(resolveTheme(null, null)).toEqual({ style: "nordic", ...STYLE_DEFAULTS.nordic });
    expect(resolveTheme({ style: "ukjent" }, null).style).toBe("nordic");
  });

  it("henter standardverdiene fra stilen som gjelder, og beholder farger og skrift som er valgt", () => {
    // Merkevaren har Nordisk og en egen hovedfarge. Siden bytter til Klassisk.
    const theme = resolveTheme({ style: "nordic", primary: "#5F6B58" }, { style: "classic" });
    expect(theme).toEqual({ ...STYLE_DEFAULTS.classic, style: "classic", primary: "#5F6B58" });
    // Siden kan også gå andre veien.
    expect(resolveTheme({ style: "classic" }, { style: "nordic" })).toEqual({ style: "nordic", ...STYLE_DEFAULTS.nordic });
    expect(resolveTheme({ style: "classic", heading_font: "lora" }, null)).toMatchObject({ style: "classic", heading_font: "lora", body_font: "inter" });
  });

  it("har standardfarger med god kontrast i begge stilene", () => {
    for (const style of SITE_STYLES) {
      const theme = resolveTheme({ style }, null);
      const variables = themeStyle(theme) as Record<string, string>;
      // Brødtekst, hovedfargen som tekst og tekst på hovedfargen
      expect(contrastRatio(theme.foreground, theme.background), style).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(variables["--site-primary-text"] ?? "", theme.background), style).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(variables["--site-primary-foreground"] ?? "", theme.primary), style).toBeGreaterThanOrEqual(4.5);
      // Tekst på de dempede seksjonene
      expect(contrastRatio(theme.foreground, variables["--site-tint"] ?? ""), style).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(variables["--site-primary-text"] ?? "", variables["--site-tint"] ?? ""), style).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("bruker tekstfargen i stedet for hovedfargen når hovedfargen er for lys som tekst", () => {
    expect(primaryTextColor({ primary: "#5F6B58", background: "#F7F6F2", foreground: "#2B2B28" })).toBe("#5F6B58");
    expect(primaryTextColor({ primary: "#C9D8C5", background: "#F7F6F2", foreground: "#2B2B28" })).toBe("#2B2B28");
    expect(mixColors("#000000", "#FFFFFF", 0.5)).toBe("#808080");
    expect(mixColors("#5F6B58", "#F7F6F2", 0)).toBe("#F7F6F2");
  });

  it("velger tekstfarge med god nok kontrast på knapper", () => {
    for (const color of ["#1F3A5F", "#C8892B", "#FFD500", "#2E9E5B", "#000000", "#FFFFFF"]) {
      expect(contrastRatio(color, readableTextOn(color))).toBeGreaterThanOrEqual(4.5);
    }
    expect(readableTextOn("#FFD500")).toBe("#111827");
    expect(readableTextOn("#1F3A5F")).toBe("#FFFFFF");
  });
});

describe("tekstformatering", () => {
  it("lager overskrifter, lister og avsnitt", () => {
    expect(parseRichText("## Beliggenhet\n\nKort vei til sjøen.\nOg til byen.\n\n- Skole\n- Butikk\n\n1. Først\n2. Så")).toEqual([
      { type: "heading", level: 3, text: "Beliggenhet" },
      { type: "paragraph", lines: ["Kort vei til sjøen.", "Og til byen."] },
      { type: "list", ordered: false, items: ["Skole", "Butikk"] },
      { type: "list", ordered: true, items: ["Først", "Så"] },
    ]);
  });

  it("tillater bare trygge lenker", () => {
    expect(isSafeHref("https://kartverket.no")).toBe(true);
    expect(isSafeHref("mailto:post@example.no")).toBe(true);
    expect(isSafeHref("#interesse")).toBe(true);
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,x")).toBe(false);
  });
});

describe("adresser og lenker", () => {
  const pages = [
    { id: "p1", title: "Forside", slug: "forside", isHome: true },
    { id: "p2", title: "Boliger", slug: "boliger", isHome: false },
  ];

  it("gir sider adresse med og uten basePath", () => {
    expect(pageHref({ basePath: "", pages }, "p1")).toBe("/");
    expect(pageHref({ basePath: "", pages }, "p2")).toBe("/boliger");
    expect(pageHref({ basePath: "/preview/abc", pages }, "p1")).toBe("/preview/abc");
    expect(pageHref({ basePath: "/preview/abc", pages }, "p2")).toBe("/preview/abc/boliger");
    expect(resolveLink({ basePath: "", pages }, { type: "page", page_id: "slettet" })).toBeNull();
    expect(resolveLink({ basePath: "", pages }, { type: "url", url: "https://finn.no" })).toEqual({ href: "https://finn.no", external: true });
  });

  it("validerer underdomener og sideadresser som databasen", () => {
    expect(subdomainSchema.safeParse(" Fjordparken ").data).toBe("fjordparken");
    expect(subdomainSchema.safeParse("app").success).toBe(false);
    expect(subdomainSchema.safeParse("-feil").success).toBe(false);
    expect(pageSlugSchema.safeParse("om-prosjektet").success).toBe(true);
    expect(pageSlugSchema.safeParse("bolig").success).toBe(false);
    expect(pageSlugSchema.safeParse("Ø").success).toBe(false);
  });

  it("lager adressen til prosjektsiden", () => {
    expect(siteUrl("fjordparken", null, "boligplattform.no", "https://app.boligplattform.no")).toBe("https://fjordparken.boligplattform.no");
    expect(siteUrl("fjordparken", "www.fjordparken.no", "boligplattform.no", "https://app.boligplattform.no")).toBe("https://www.fjordparken.no");
    expect(siteUrl("fjordparken", null, "localhost:3000", "http://localhost:3000")).toBe("http://fjordparken.localhost:3000");
  });

  it("hopper over ugyldige menypunkter", () => {
    expect(
      parseNav([
        { id: "a", label: "Boliger", link: { type: "block", block_id: "velger" } },
        { id: "b", label: "", link: { type: "page", page_id: "00000000-0000-4000-8000-000000000001" } },
        { id: "c", label: "Farlig", link: { type: "url", url: "javascript:x" } },
      ]).map((item) => item.id),
    ).toEqual(["a"]);
  });
});
