import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { vercelDomains } from "@/features/domains/check";
import { DomainSettings } from "@/features/domains/components/domain-settings";
import { listDomainSites } from "@/features/domains/queries";
import { getOrgContext } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { publicEnv } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("domains");
  return { title: t("title") };
}

/** Innstillinger → Domener: egne domener for prosjektsidene (eier og administrator). */
export default async function DomainsPage({ params }: PageProps<"/[org]/settings/domains">) {
  const { org } = await params;
  const context = await getOrgContext(org);
  if (!can(context.role, "domains.manage")) {
    notFound();
  }
  const sites = await listDomainSites(context.organization.id);
  return (
    <DomainSettings
      organizationId={context.organization.id}
      sites={sites}
      platformDomain={publicEnv().platformDomain}
      vercelConnected={vercelDomains() !== null}
      readOnly={!context.writable}
    />
  );
}
