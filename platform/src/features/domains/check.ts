import "server-only";

import * as Sentry from "@sentry/nextjs";

import { dnsLookup } from "@/features/domains/dns";
import {
  evaluateDomain,
  ownershipRecordName,
  type DomainCheckResult,
  type DomainLookups,
  type DomainStatus,
} from "@/features/domains/records";
import { VercelDomainsClient, type VercelDomain, type VercelDomainConfig } from "@/features/domains/vercel";
import { serverEnv } from "@/lib/env.server";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/** Vercel-klienten, eller null når kontoen ikke er koblet til (lokalt og i tester). */
export function vercelDomains(): VercelDomainsClient | null {
  const env = serverEnv();
  if (!env.vercelApiToken || !env.vercelProjectId) {
    return null;
  }
  return new VercelDomainsClient({ token: env.vercelApiToken, projectId: env.vercelProjectId, teamId: env.vercelTeamId });
}

/** Slår opp DNS og spør Vercel, og vurderer domenet. Feil i oppslagene blir status «error». */
export async function checkDomain(hostname: string, token: string): Promise<DomainCheckResult> {
  const env = serverEnv();
  const client = vercelDomains();

  let vercel: { domain: VercelDomain | null; config: VercelDomainConfig | null; failed: boolean } | null = null;
  if (client) {
    try {
      let domain = (await client.getDomain(hostname)) ?? (await client.addDomain(hostname));
      if (!domain.verified) {
        domain = await client.verifyDomain(hostname);
      }
      vercel = { domain, config: await client.getConfig(hostname), failed: false };
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      vercel = { domain: null, config: null, failed: true };
    }
  }

  const settings = { txtPrefix: env.domainTxtPrefix, cnameTarget: env.domainCnameTarget, aRecord: env.domainARecord };
  const lookup = (name: string, type: "TXT" | "CNAME" | "A") => dnsLookup(env.dnsOverHttpsUrl, name, type);
  let lookups: DomainLookups;
  try {
    const [txt, cname, a] = await Promise.all([
      lookup(ownershipRecordName(hostname, env.domainTxtPrefix), "TXT"),
      lookup(hostname, "CNAME"),
      lookup(hostname, "A"),
    ]);
    lookups = { txt, cname, a };
  } catch (error) {
    // Postene vises fortsatt som veiledning, men ingen av dem kunne kontrolleres.
    console.error(error);
    const unchecked = evaluateDomain(hostname, token, settings, { txt: [], cname: [], a: [] }, vercel);
    return { ...unchecked, status: "error", error: "lookup_failed" };
  }
  return evaluateDomain(hostname, token, settings, lookups, vercel);
}

export type DomainToCheck = {
  id: string;
  siteId: string;
  hostname: string;
  verificationToken: string;
  verified: boolean;
};

export type RecordedCheck = {
  status: DomainStatus | null;
  /** Domenet ble bekreftet nå. Mellomlageret for vertsnavnet må tømmes. */
  becameVerified: boolean;
};

/**
 * Sjekker domenet og lagrer resultatet med record_domain_check() (service-rollen).
 * Feil i oppslagene lagres på domenet, slik at admin viser dem.
 */
export async function checkAndRecordDomain(admin: AdminClient, domain: DomainToCheck): Promise<RecordedCheck> {
  const result = await checkDomain(domain.hostname, domain.verificationToken);
  const { data, error } = await admin.rpc("record_domain_check", {
    p_domain_id: domain.id,
    p_status: result.status,
    p_dns_records: result.records,
    p_error: result.error ?? undefined,
  });
  if (error) {
    throw error;
  }
  const status = (data as DomainStatus | null) ?? null;
  return { status, becameVerified: !domain.verified && status === "verified" };
}
