import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { LeadsListView } from "@/features/leads/components/leads-list-view";
import { parseLeadFilters } from "@/features/leads/filters";
import { listLeadProjects, listLeads } from "@/features/leads/queries";
import { getOrgContext } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("leads");
  return { title: t("title") };
}

/** Alle henvendelser i prosjektene brukeren ser leads i. */
export default async function LeadsPage({ params, searchParams }: PageProps<"/[org]/leads">) {
  const { org } = await params;
  const context = await getOrgContext(org);
  if (!can(context.role, "leads.read")) {
    notFound();
  }
  const filters = parseLeadFilters(await searchParams);
  const [t, result, projects] = await Promise.all([
    getTranslations("leads"),
    listLeads(context.organization.id, filters),
    listLeadProjects(context.organization.id),
  ]);
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <LeadsListView
        orgSlug={org}
        basePath={`/${org}/leads`}
        filters={filters}
        leads={result.leads}
        total={result.total}
        projects={projects}
        showProject
      />
    </div>
  );
}
