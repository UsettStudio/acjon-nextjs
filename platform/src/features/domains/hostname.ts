/**
 * Vertsnavn for egne domener. Samme mønster som CHECK-regelen på
 * domains.hostname: små bokstaver, punycode, minst to ledd og et toppdomene
 * som starter med en bokstav.
 */
export const HOSTNAME_PATTERN = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,61}[a-z0-9]$/;

/** Toppdomener som aldri kan brukes på internett. */
const BLOCKED_SUFFIXES = ["localhost", "local", "internal", "invalid", "onion", "arpa", "home", "lan"];

/**
 * Gjør det brukeren skriver om til et vertsnavn: fjerner protokoll, sti,
 * port og punktum til slutt, og gjør om til små bokstaver og punycode
 * (fjordutsikt-æøå.no → xn--fjordutsikt--xxx.no).
 */
export function normalizeHostname(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }
  const withoutProtocol = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  const candidate = withoutProtocol.split(/[/?#]/, 1)[0]?.replace(/\.$/, "") ?? "";
  if (!candidate || /[\s@]/.test(candidate)) {
    return null;
  }
  try {
    const hostname = new URL(`http://${candidate}`).hostname.replace(/\.$/, "");
    return hostname || null;
  } catch {
    return null;
  }
}

export type HostnameProblem = "hostnameInvalid" | "hostnamePlatform";

/**
 * Om vertsnavnet kan brukes som eget domene. Plattformens egne adresser
 * (admin og underdomener) og Vercel sine adresser kan ikke legges til.
 */
export function hostnameProblem(hostname: string, platformDomain: string, appUrl: string): HostnameProblem | null {
  if (hostname.length > 253 || !HOSTNAME_PATTERN.test(hostname)) {
    return "hostnameInvalid";
  }
  const tld = hostname.slice(hostname.lastIndexOf(".") + 1);
  if (BLOCKED_SUFFIXES.includes(tld)) {
    return "hostnameInvalid";
  }
  const platform = platformDomain.trim().toLowerCase().replace(/:\d+$/, "");
  let appHost = "";
  try {
    appHost = new URL(appUrl).hostname.toLowerCase();
  } catch {
    appHost = "";
  }
  const ownHosts = [platform, appHost].filter(Boolean);
  if (
    ownHosts.some((own) => hostname === own || hostname.endsWith(`.${own}`)) ||
    hostname.endsWith(".vercel.app") ||
    hostname.endsWith(".vercel-dns.com")
  ) {
    return "hostnamePlatform";
  }
  return null;
}

/**
 * Om domenet er et rotdomene (fjordparken.no) og ikke et underdomene
 * (www.fjordparken.no). Et rotdomene kan ikke ha CNAME hos de fleste
 * DNS-leverandører og må peke med en A-post. Vurderingen bruker antall ledd;
 * Vercel oppgir rotdomenet når kontoen er koblet til.
 */
export function isApexDomain(hostname: string, apexName?: string | null): boolean {
  if (apexName) {
    return hostname === apexName;
  }
  return hostname.split(".").length === 2;
}
