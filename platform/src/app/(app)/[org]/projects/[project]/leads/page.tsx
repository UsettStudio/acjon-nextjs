import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { LeadsListView } from "@/features/leads/components/leads-list-view";
import { parseLeadFilters } from "@/features/leads/filters";
import { listLeadUnits, listLeads } from "@/features/leads/queries";
import { getProjectContext } from "@/features/projects/queries";
import { can } from "@/lib/auth/permissions";

export async function generateMetadata({ params }: PageProps<"/[org]/projects/[project]/leads">): Promise<Metadata> {
  const { org, project } = await params;
  const [context, t] = await Promise.all([getProjectContext(org, project), getTranslations("leads")]);
  return { title: t("projectTitle", { project: context.project.name }) };
}

/** Henvendelsene i ett prosjekt. */
export default async function ProjectLeadsPage({ params, searchParams }: PageProps<"/[org]/projects/[project]/leads">) {
  const { org, project: slug } = await params;
  const context = await getProjectContext(org, slug);
  if (!can(context.role, "leads.read")) {
    notFound();
  }
  const filters = { ...parseLeadFilters(await searchParams), projectId: context.project.id };
  const [result, units] = await Promise.all([listLeads(context.organization.id, filters), listLeadUnits(context.project.id)]);
  return (
    <LeadsListView
      orgSlug={org}
      basePath={`/${org}/projects/${slug}/leads`}
      filters={filters}
      leads={result.leads}
      total={result.total}
      units={units}
      showProject={false}
    />
  );
}
