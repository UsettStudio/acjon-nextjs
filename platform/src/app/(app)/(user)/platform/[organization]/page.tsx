import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LaunchByAgreementDialog } from "@/features/platform/components/launch-by-agreement-dialog";
import { getPlatformOrganization } from "@/features/platform/queries";
import { isPlatformAdmin } from "@/lib/auth/dal";
import { formatDate, formatNumber } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform");
  return { title: t("title") };
}

/**
 * Plattformadmin → én organisasjon: pakke, brukere og prosjektene med
 * lanseringen. Herfra lanseres prosjekter etter avtale (uten oppstartsavgift).
 */
async function OrganizationDetails({ params }: { params: PageProps<"/platform/[organization]">["params"] }) {
  if (!(await isPlatformAdmin())) {
    notFound();
  }
  const { organization: slug } = await params;
  const organization = await getPlatformOrganization(slug);
  if (!organization) {
    notFound();
  }
  const [t, tPlans, tStatus, tPhases] = await Promise.all([
    getTranslations("platform.organization"),
    getTranslations("billing.plans"),
    getTranslations("subscriptionStatus"),
    getTranslations("projects.phases"),
  ]);

  return (
    <>
      <p className="mb-2 text-sm">
        <Link href="/platform" className="text-muted-foreground hover:text-foreground hover:underline">
          {t("back")}
        </Link>
      </p>
      <PageHeader
        title={organization.name}
        description={t("summary", {
          plan: tPlans(`${organization.plan}.name`),
          status: tStatus(organization.status),
          members: organization.members,
          created: formatDate(organization.createdAt),
        })}
      />
      <section aria-labelledby="prosjekter" className="grid gap-3">
        <h2 id="prosjekter" className="text-lg font-semibold">
          {t("projectsTitle")}
        </h2>
        {organization.projects.length === 0 ? (
          <p className="text-muted-foreground">{t("noProjects")}</p>
        ) : (
          <Table>
            <TableCaption className="sr-only">{t("projectsTitle")}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{t("project")}</TableHead>
                <TableHead>{t("phase")}</TableHead>
                <TableHead className="text-right">{t("units")}</TableHead>
                <TableHead>{t("launch")}</TableHead>
                <TableHead>
                  <span className="sr-only">{t("actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organization.projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{tPhases(project.phase)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(project.units)}</TableCell>
                  <TableCell>
                    {project.launchedAt === null
                      ? t("notLaunched")
                      : project.unitLimit === null
                        ? t("launchedUnlimited", { date: formatDate(project.launchedAt) })
                        : t("launchedLimit", { date: formatDate(project.launchedAt), count: project.unitLimit })}
                  </TableCell>
                  <TableCell className="text-right">
                    {project.launchedAt !== null && project.unitLimit === null ? null : (
                      <LaunchByAgreementDialog
                        projectId={project.id}
                        projectName={project.name}
                        launched={project.launchedAt !== null}
                        currentLimit={project.unitLimit}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </>
  );
}

export default function PlatformOrganizationPage({ params }: PageProps<"/platform/[organization]">) {
  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <OrganizationDetails params={params} />
    </Suspense>
  );
}
