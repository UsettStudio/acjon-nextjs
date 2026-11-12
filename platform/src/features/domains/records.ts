import { z } from "zod";

import { isApexDomain } from "@/features/domains/hostname";
import type { DnsRecordType } from "@/features/domains/dns";
import type { VercelDomain, VercelDomainConfig } from "@/features/domains/vercel";

/**
 * DNS-postene kunden må sette for et eget domene, og vurderingen av om de er
 * på plass. Lagres i domains.dns_records og vises som veiledning i admin.
 *
 *   ownership: TXT-post med domenets token. Viser at kunden eier domenet.
 *   routing:   CNAME (underdomene) eller A (rotdomene) som peker til plattformen.
 *   vercel:    TXT-post Vercel krever når domenet er i bruk på en annen Vercel-konto.
 */

export const DOMAIN_STATUSES = ["pending", "verified", "misconfigured", "error"] as const;
export type DomainStatus = (typeof DOMAIN_STATUSES)[number];

export const DOMAIN_ERRORS = [
  "txt_missing",
  "dns_not_pointing",
  "vercel_verification",
  "vercel_unavailable",
  "lookup_failed",
  "hostname_taken",
] as const;
export type DomainError = (typeof DOMAIN_ERRORS)[number];

export const domainRecordSchema = z.object({
  type: z.enum(["TXT", "CNAME", "A"]),
  name: z.string(),
  value: z.string(),
  purpose: z.enum(["ownership", "routing", "vercel"]),
  ok: z.boolean(),
});
export type DomainRecord = z.infer<typeof domainRecordSchema>;

export function parseDomainRecords(value: unknown): DomainRecord[] {
  const parsed = z.array(domainRecordSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function parseDomainError(value: string | null): DomainError | null {
  return value && (DOMAIN_ERRORS as readonly string[]).includes(value) ? (value as DomainError) : null;
}

export type DomainCheckResult = {
  status: DomainStatus;
  records: DomainRecord[];
  error: DomainError | null;
};

export type DomainCheckSettings = {
  txtPrefix: string;
  cnameTarget: string;
  aRecord: string;
};

export type DomainLookups = {
  /** Verdiene i TXT-posten {prefix}.{domene}. */
  txt: string[];
  cname: string[];
  a: string[];
};

/** Navnet på TXT-posten som viser eierskap. */
export function ownershipRecordName(hostname: string, txtPrefix: string): string {
  return `${txtPrefix}.${hostname}`;
}

/**
 * Vurderer domenet ut fra DNS-oppslagene og (når kontoen er koblet til)
 * svaret fra Vercel. Domenet er bekreftet når eierskapet er vist og
 * trafikken går til plattformen.
 */
export function evaluateDomain(
  hostname: string,
  token: string,
  settings: DomainCheckSettings,
  lookups: DomainLookups,
  vercel: { domain: VercelDomain | null; config: VercelDomainConfig | null; failed: boolean } | null,
): DomainCheckResult {
  const apex = isApexDomain(hostname, vercel?.domain?.apexName);
  const cnameTarget = vercel?.config?.cname ?? settings.cnameTarget;
  const aRecords = vercel?.config && vercel.config.aRecords.length > 0 ? vercel.config.aRecords : [settings.aRecord];

  const ownershipOk = lookups.txt.some((value) => value.trim() === token);
  const pointsByDns =
    lookups.cname.some((value) => value === cnameTarget || value.endsWith(".vercel-dns.com")) ||
    lookups.a.some((value) => aRecords.includes(value));
  const routingOk = vercel?.config ? !vercel.config.misconfigured : pointsByDns;
  const vercelPending = Boolean(vercel?.domain && !vercel.domain.verified);

  const records: DomainRecord[] = [
    { type: "TXT", name: ownershipRecordName(hostname, settings.txtPrefix), value: token, purpose: "ownership", ok: ownershipOk },
    ...(apex
      ? aRecords.map((value): DomainRecord => ({ type: "A", name: hostname, value, purpose: "routing", ok: routingOk }))
      : [{ type: "CNAME", name: hostname, value: cnameTarget, purpose: "routing", ok: routingOk } satisfies DomainRecord]),
    ...(vercelPending
      ? (vercel?.domain?.challenges ?? []).flatMap((challenge): DomainRecord[] =>
          challenge.type === "TXT" || challenge.type === "CNAME" || challenge.type === "A"
            ? [{ type: challenge.type as DnsRecordType & DomainRecord["type"], name: challenge.name, value: challenge.value, purpose: "vercel", ok: false }]
            : [],
        )
      : []),
  ];

  if (vercel?.failed) {
    return { status: "error", records, error: "vercel_unavailable" };
  }
  if (!ownershipOk) {
    return { status: "pending", records, error: "txt_missing" };
  }
  if (vercelPending) {
    return { status: "pending", records, error: "vercel_verification" };
  }
  if (!routingOk) {
    return { status: "misconfigured", records, error: "dns_not_pointing" };
  }
  return { status: "verified", records, error: null };
}
