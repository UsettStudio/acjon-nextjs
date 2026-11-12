/**
 * Hvilken del av plattformen et vertsnavn hører til:
 *   app.[PLATTFORMDOMENE] (og lokalt localhost)  → admin
 *   {prosjekt}.[PLATTFORMDOMENE]                  → publisert prosjektside (underdomene)
 *   alt annet                                     → publisert prosjektside på eget domene
 * Vercel sine forhåndsvisninger (*.vercel.app) og lokale adresser regnes som admin.
 */

/** Samme liste som app.is_reserved_subdomain() i databasen. */
export const RESERVED_SUBDOMAINS = new Set([
  "app", "www", "api", "admin", "auth", "login", "mail", "smtp", "static", "assets",
  "cdn", "media", "embed", "docs", "help", "support", "status", "blog", "dev", "staging",
  "test", "preview", "demo", "platform", "plattform", "dashboard", "billing", "webhooks",
]);

export type HostKind = { kind: "app" } | { kind: "site"; key: string };

export function classifyHost(host: string, appUrl: string, platformDomain: string): HostKind {
  const hostname = host.trim().toLowerCase();
  if (!hostname) {
    return { kind: "app" };
  }
  let appHost = "";
  try {
    appHost = new URL(appUrl).host.toLowerCase();
  } catch {
    appHost = "";
  }
  if (hostname === appHost) {
    return { kind: "app" };
  }
  const platform = platformDomain.trim().toLowerCase();
  if (platform && (hostname === platform || hostname === `www.${platform}`)) {
    return { kind: "app" };
  }
  if (platform && hostname.endsWith(`.${platform}`)) {
    const subdomain = hostname.slice(0, -(platform.length + 1));
    if (!subdomain || subdomain.includes(".") || RESERVED_SUBDOMAINS.has(subdomain)) {
      return { kind: "app" };
    }
    return { kind: "site", key: subdomain };
  }
  const bare = hostname.replace(/:\d+$/, "");
  if (bare === "localhost" || bare === "127.0.0.1" || bare === "[::1]" || bare.endsWith(".vercel.app") || bare.endsWith(".local") || !bare.includes(".")) {
    return { kind: "app" };
  }
  return { kind: "site", key: bare };
}
