/**
 * Tema for prosjektsider. Merkevareprofilen ligger på organisasjonen
 * (organizations.brand) og gjenbrukes på alle prosjektsider. Hver prosjektside
 * kan overstyre den (sites.theme). Felt som mangler, arver:
 *   designstil ← merkevareprofil ← prosjektside
 *
 * Designstilen bestemmer utseendet på blokkene og standardverdiene for farger,
 * skrift og knapper. Farger og skrift fra merkevareprofilen gjelder i alle stilene.
 *   nordic   lys og luftig: tynn skrift, små overtitler, rolige farger og fargede seksjoner
 *   classic  tydelige overskrifter og avrundede knapper (utseendet fra fase 3)
 */

import type { CSSProperties } from "react";
import { z } from "zod";

export const SITE_STYLES = ["nordic", "classic"] as const;
export type SiteStyle = (typeof SITE_STYLES)[number];

export const FONT_KEYS = ["jost", "inter", "dm_sans", "lora", "playfair"] as const;
export type FontKey = (typeof FONT_KEYS)[number];

export const BUTTON_STYLES = ["rounded", "pill", "square"] as const;
export type ButtonStyle = (typeof BUTTON_STYLES)[number];

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "colorInvalid" });

/** Merkevareprofil og overstyring per side. Alle felt er valgfrie. */
export const themeSchema = z.object({
  style: z.enum(SITE_STYLES, { error: "optionInvalid" }).optional(),
  primary: hex.optional(),
  accent: hex.optional(),
  background: hex.optional(),
  foreground: hex.optional(),
  heading_font: z.enum(FONT_KEYS, { error: "optionInvalid" }).optional(),
  body_font: z.enum(FONT_KEYS, { error: "optionInvalid" }).optional(),
  button_style: z.enum(BUTTON_STYLES, { error: "optionInvalid" }).optional(),
  /** Bare på prosjektsiden: egen logo i stedet for organisasjonens. */
  logo_asset_id: z.uuid({ error: "optionInvalid" }).nullable().optional(),
});

export type ThemeInput = z.input<typeof themeSchema>;
export type ThemeOverrides = z.output<typeof themeSchema>;

export type ResolvedTheme = {
  style: SiteStyle;
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  heading_font: FontKey;
  body_font: FontKey;
  button_style: ButtonStyle;
};

type StyleDefaults = Omit<ResolvedTheme, "style">;

/**
 * Standardverdiene i hver designstil. Hovedfargen i Nordisk er en dempet
 * salviegrønn som gir hvit tekst kontrast på 5,6:1 (WCAG 2.1 AA krever 4,5:1).
 */
export const STYLE_DEFAULTS: Record<SiteStyle, StyleDefaults> = {
  nordic: {
    primary: "#5F6B58",
    accent: "#B59F7B",
    background: "#F7F6F2",
    foreground: "#2B2B28",
    heading_font: "jost",
    body_font: "jost",
    button_style: "square",
  },
  classic: {
    primary: "#1F3A5F",
    accent: "#C8892B",
    background: "#FFFFFF",
    foreground: "#1A202C",
    heading_font: "inter",
    body_font: "inter",
    button_style: "rounded",
  },
};

/** Stilen nye prosjektsider får når verken merkevareprofilen eller siden har valgt en. */
export const DEFAULT_STYLE: SiteStyle = "nordic";

export const DEFAULT_THEME: ResolvedTheme = { style: DEFAULT_STYLE, ...STYLE_DEFAULTS[DEFAULT_STYLE] };

/** Tolker et lagret tema. Ugyldige felt hoppes over i stedet for å stoppe siden. */
export function parseTheme(value: unknown): ThemeOverrides {
  if (typeof value !== "object" || value === null) {
    return {};
  }
  const result: ThemeOverrides = {};
  for (const [key, schema] of Object.entries(themeSchema.shape)) {
    const parsed = schema.safeParse((value as Record<string, unknown>)[key]);
    if (parsed.success && parsed.data !== undefined) {
      (result as Record<string, unknown>)[key] = parsed.data;
    }
  }
  return result;
}

export function resolveTheme(brand: unknown, site: unknown): ResolvedTheme {
  const fromBrand = parseTheme(brand);
  const fromSite = parseTheme(site);
  const style = fromSite.style ?? fromBrand.style ?? DEFAULT_STYLE;
  const defaults = STYLE_DEFAULTS[style];
  const pick = <K extends keyof StyleDefaults>(key: K): StyleDefaults[K] => (fromSite[key] ?? fromBrand[key] ?? defaults[key]) as StyleDefaults[K];
  return {
    style,
    primary: pick("primary"),
    accent: pick("accent"),
    background: pick("background"),
    foreground: pick("foreground"),
    heading_font: pick("heading_font"),
    body_font: pick("body_font"),
    button_style: pick("button_style"),
  };
}

// -----------------------------------------------------------------------------
// Kontrast (WCAG 2.1): tekst på fargede flater skal ha minst 4,5:1
// -----------------------------------------------------------------------------

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: string): number {
  const value = color.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** Hvit eller nesten svart tekst, det som gir best kontrast mot bakgrunnen. */
export function readableTextOn(background: string): string {
  return contrastRatio(background, "#FFFFFF") >= contrastRatio(background, "#111827") ? "#FFFFFF" : "#111827";
}

const FONT_STACKS: Record<FontKey, string> = {
  jost: "var(--font-site-jost), ui-sans-serif, system-ui, sans-serif",
  inter: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  dm_sans: "var(--font-site-dm-sans), ui-sans-serif, system-ui, sans-serif",
  lora: "var(--font-site-lora), ui-serif, Georgia, serif",
  playfair: "var(--font-site-playfair), ui-serif, Georgia, serif",
};

const RADIUS: Record<ButtonStyle, string> = { rounded: "0.5rem", pill: "9999px", square: "0" };

/** Blander to farger (andel 0–1 av den første), som color-mix i CSS. */
export function mixColors(a: string, b: string, share: number): string {
  const channels = (color: string) => [1, 3, 5].map((index) => Number.parseInt(color.slice(index, index + 2), 16));
  const [first, second] = [channels(a), channels(b)];
  return `#${first.map((value, index) => Math.round(value * share + (second[index] ?? 0) * (1 - share)).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

/** Hovedfargen når den kan brukes som tekst på bakgrunnen (minst 4,5:1), ellers tekstfargen. */
export function primaryTextColor(theme: Pick<ResolvedTheme, "primary" | "background" | "foreground">): string {
  return contrastRatio(theme.primary, theme.background) >= 4.5 ? theme.primary : theme.foreground;
}

/** CSS-variabler som blokkene bruker. Settes på rotelementet til prosjektsiden. */
export function themeStyle(theme: ResolvedTheme): CSSProperties {
  return {
    "--site-primary": theme.primary,
    "--site-primary-foreground": readableTextOn(theme.primary),
    "--site-primary-text": primaryTextColor(theme),
    // Dempede seksjoner: en svak tone av hovedfargen over bakgrunnen.
    "--site-tint": mixColors(theme.primary, theme.background, 0.08),
    "--site-accent": theme.accent,
    "--site-accent-foreground": readableTextOn(theme.accent),
    "--site-background": theme.background,
    "--site-foreground": theme.foreground,
    "--site-heading-font": FONT_STACKS[theme.heading_font],
    "--site-body-font": FONT_STACKS[theme.body_font],
    "--site-radius": RADIUS[theme.button_style],
    backgroundColor: theme.background,
    color: theme.foreground,
    fontFamily: FONT_STACKS[theme.body_font],
  } as CSSProperties;
}
