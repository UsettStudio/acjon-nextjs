import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Building2Icon, MapPinIcon, PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/features/projects/queries";
import { StatusDistribution } from "@/features/units/components/unit-status-badge";
import { can } from "@/lib/auth/permissions";
import { getOrgContext } from "@/lib/auth/dal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects.list");
  return { title: t("title") };
}

export default async function ProjectsPage({ params }: PageProps<"/[org]/projects">) {
  const { org } = await params;
  const context = await getOrgContext(org);
  const [t, tPhases, projects] = await Promise.all([
    getTranslations("projects.list"),
    getTranslations("projects.phases"),
    listProjects(context.organization.id),
  ]);
  const canCreate = context.writable && can(context.role, "projects.create");

  return (
    <>
      <PageHeader
        title={t("title")}
        description={can(context.role, "projects.viewAll") ? t("descriptionAll") : t("descriptionAssigned")}
        actions={
          canCreate ? (
            <Button asChild>
              <Link href={`/${org}/projects/new`}>
                <PlusIcon aria-hidden="true" />
                {t("new")}
              </Link>
            </Button>
          ) : null
        }
      />
      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
          <Building2Icon aria-hidden="true" className="size-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t("emptyTitle")}</h2>
          <p className="max-w-md text-muted-foreground">{canCreate ? t("emptyBody") : t("emptyBodyNoAccess")}</p>
          {canCreate ? (
            <Button asChild>
              <Link href={`/${org}/projects/new`}>{t("new")}</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/${org}/projects/${project.slug}`}
                className="flex h-full flex-col gap-4 rounded-lg border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Badge variant="secondary">{tPhases(project.phase)}</Badge>
                    {project.launched ? null : <Badge variant="outline">{t("notLaunched")}</Badge>}
                  </div>
                </div>
                {project.address || project.city ? (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPinIcon aria-hidden="true" className="size-4" />
                    {[project.address, project.city].filter(Boolean).join(", ")}
                  </p>
                ) : null}
                <div className="mt-auto grid gap-2">
                  <p className="text-sm">{t("unitCount", { count: project.totalUnits })}</p>
                  <StatusDistribution counts={project.counts} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
