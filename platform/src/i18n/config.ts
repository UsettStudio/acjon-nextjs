export const locales = ["nb", "en", "sv"] as const;
export type Locale = (typeof locales)[number];

/** Norsk bokmål er standard i admin og på publiserte sider. */
export const defaultLocale: Locale = "nb";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
