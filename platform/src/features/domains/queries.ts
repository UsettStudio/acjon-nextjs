import "server-only";

import {
  evaluateDomain,
  parseDomainError,
  parseDomainRecords,
  type DomainError,
  type DomainRecord,
  type DomainStatus,
} from "@/features/domains/records";
import { serverEnv } from "@/lib/env.server";
import { createClient } from "@/lib/supabase/server";

export type DomainItem = {
  id: string;
  siteId: string;
  hostname: string;
  isPrimary: boolean;
  status: DomainStatus;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  error: DomainError | null;
  records: DomainRecord[];
};

export type DomainSite = {
  id: string;
  subdomain: string;
  published: boolean;
  projectName: string;
  domains: DomainItem[];
};

const STATUSES = new Set<DomainStatus>(["pending", "verified", "misconfigured", "error"]);

/** Prosjektsidene i organisasjonen med egne domener. Brukes under Innstillinger → Domener. */
export async function listDomainSites(organizationId: string): Promise<DomainSite[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select(
      "id, subdomain, published_at, project:projects(name), domains(id, site_id, hostname, is_primary, status, verified_at, last_checked_at, last_error, dns_records, verification_token, created_at)",
    )
    .eq("organization_id", organizationId)
    .order("subdomain");
  if (error) {
    throw error;
  }
  const env = serverEnv();
  const settings = { txtPrefix: env.domainTxtPrefix, cnameTarget: env.domainCnameTarget, aRecord: env.domainARecord };
  return data
    .map((site) => ({
      id: site.id,
      subdomain: site.subdomain,
      published: site.published_at !== null,
      projectName: site.project?.name ?? site.subdomain,
      domains: [...site.domains]
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((domain): DomainItem => {
          const stored = parseDomainRecords(domain.dns_records);
          return {
            id: domain.id,
            siteId: domain.site_id,
            hostname: domain.hostname,
            isPrimary: domain.is_primary,
            status: STATUSES.has(domain.status as DomainStatus) ? (domain.status as DomainStatus) : "pending",
            verifiedAt: domain.verified_at,
            lastCheckedAt: domain.last_checked_at,
            error: parseDomainError(domain.last_error),
            // Før første sjekk vises postene slik de skal være, uten svar fra Vercel.
            records:
              stored.length > 0
                ? stored
                : evaluateDomain(domain.hostname, domain.verification_token, settings, { txt: [], cname: [], a: [] }, null).records,
          };
        }),
    }))
    .sort((a, b) => a.projectName.localeCompare(b.projectName, "nb"));
}
