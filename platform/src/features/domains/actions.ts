"use server";

import * as Sentry from "@sentry/nextjs";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";

import { checkAndRecordDomain, vercelDomains } from "@/features/domains/check";
import { hostnameProblem, normalizeHostname } from "@/features/domains/hostname";
import type { DomainStatus } from "@/features/domains/records";
import { siteTags } from "@/features/site-builder/render-data";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { ActionError, postgresErrorCode, requireOrgCapability, runAction } from "@/lib/actions/server";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type DomainActionError = "domainExists" | "domainLimit";

const uuid = z.uuid();

function requireId(value: unknown): string {
  const parsed = uuid.safeParse(value);
  if (!parsed.success) {
    throw new ActionError("invalidInput");
  }
  return parsed.data;
}

/** Domenet, lest med brukerens tilgang (RLS). Finnes det ikke i organisasjonen, stopper handlingen. */
async function loadDomain(organizationId: string, domainId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("domains")
    .select("id, site_id, hostname, verification_token, verified_at")
    .eq("id", domainId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    throw new ActionError("notFound");
  }
  return data;
}

/** Tømmer mellomlageret for prosjektsiden og vertsnavnet, så ruting og kanonisk adresse følger endringen. */
function purgeSite(siteId: string, hostname: string) {
  updateTag(siteTags.key(hostname));
  updateTag(siteTags.site(siteId));
}

/**
 * Legger til et eget domene på en prosjektside. Domenet legges også til i
 * Vercel-prosjektet (når kontoen er koblet til) og sjekkes med en gang, så
 * DNS-postene kunden skal sette, vises med en gang.
 */
export async function addDomain(input: {
  organizationId: string;
  siteId: string;
  hostname: string;
}): Promise<ActionResult<{ id: string; status: DomainStatus | null }, DomainActionError>> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    const siteId = requireId(input.siteId);
    await requireOrgCapability(organizationId, "domains.manage");

    const hostname = typeof input.hostname === "string" && input.hostname.length <= 300 ? normalizeHostname(input.hostname) : null;
    if (!hostname) {
      return fail("invalidInput", { hostname: "hostnameInvalid" });
    }
    const env = publicEnv();
    const problem = hostnameProblem(hostname, env.platformDomain, env.appUrl);
    if (problem) {
      return fail("invalidInput", { hostname: problem });
    }

    const supabase = await createClient();
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, project_id")
      .eq("id", siteId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (siteError) {
      throw siteError;
    }
    if (!site) {
      return fail("notFound");
    }

    const { data: domain, error } = await supabase
      .from("domains")
      .insert({ organization_id: organizationId, project_id: site.project_id, site_id: site.id, hostname })
      .select("id, verification_token")
      .single();
    if (error) {
      switch (postgresErrorCode(error)) {
        case "23505":
          return fail("domainExists");
        case "P0413":
          return fail("domainLimit");
        case "42501":
          return fail("forbidden");
        default:
          throw error;
      }
    }

    const checked = await checkAndRecordDomain(createAdminClient(), {
      id: domain.id,
      siteId: site.id,
      hostname,
      verificationToken: domain.verification_token,
      verified: false,
    });
    if (checked.becameVerified) {
      purgeSite(site.id, hostname);
    }
    refresh();
    return ok({ id: domain.id, status: checked.status });
  });
}

/** «Sjekk nå»: slår opp DNS og spør Vercel med en gang, i stedet for å vente på den planlagte sjekken. */
export async function checkDomainNow(input: {
  organizationId: string;
  domainId: string;
}): Promise<ActionResult<{ status: DomainStatus | null }>> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    await requireOrgCapability(organizationId, "domains.manage");
    const domain = await loadDomain(organizationId, requireId(input.domainId));
    const checked = await checkAndRecordDomain(createAdminClient(), {
      id: domain.id,
      siteId: domain.site_id,
      hostname: domain.hostname,
      verificationToken: domain.verification_token,
      verified: domain.verified_at !== null,
    });
    if (checked.becameVerified) {
      purgeSite(domain.site_id, domain.hostname);
    }
    refresh();
    return ok({ status: checked.status });
  });
}

/**
 * Fjerner domenet. Det tas bort fra Vercel bare når ingen andre prosjektsider
 * har lagt inn samme vertsnavn, så en annen kundes bekreftede domene aldri
 * kobles fra.
 */
export async function removeDomain(input: { organizationId: string; domainId: string }): Promise<ActionResult> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    await requireOrgCapability(organizationId, "domains.manage");
    const domain = await loadDomain(organizationId, requireId(input.domainId));

    const supabase = await createClient();
    const { data: removed, error } = await supabase.from("domains").delete().eq("id", domain.id).select("id");
    if (error) {
      throw error;
    }
    if (removed.length === 0) {
      return fail("forbidden");
    }
    purgeSite(domain.site_id, domain.hostname);

    const vercel = vercelDomains();
    if (vercel) {
      const { count, error: countError } = await createAdminClient()
        .from("domains")
        .select("id", { count: "exact", head: true })
        .eq("hostname", domain.hostname);
      if (countError) {
        throw countError;
      }
      if (count === 0) {
        try {
          await vercel.removeDomain(domain.hostname);
        } catch (vercelError) {
          // Domenet er fjernet hos oss. Det som står igjen i Vercel, ruter ingen steder.
          console.error(vercelError);
          Sentry.captureException(vercelError);
        }
      }
    }
    refresh();
    return ok();
  });
}

/** Velger primærdomene for prosjektsiden, eller ingen (null): da er underdomenet hovedadressen. */
export async function setPrimaryDomain(input: {
  organizationId: string;
  siteId: string;
  domainId: string | null;
}): Promise<ActionResult> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    const siteId = requireId(input.siteId);
    const domainId = input.domainId === null ? null : requireId(input.domainId);
    await requireOrgCapability(organizationId, "domains.manage");
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_primary_domain", { p_site_id: siteId, p_domain_id: domainId ?? undefined });
    if (error) {
      switch (postgresErrorCode(error)) {
        case "42501":
          return fail("forbidden");
        case "22023":
          return fail("invalidInput");
        default:
          throw error;
      }
    }
    updateTag(siteTags.site(siteId));
    refresh();
    return ok();
  });
}
