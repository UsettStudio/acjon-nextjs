import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { NavLink } from "@/components/admin/nav-link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjectContext } from "@/features/projects/queries";
import { can } from "@/lib/auth/permissions";

async function ProjectHeader({ params }: { params: LayoutProps<"/[org]/projects/[project]">["params"] }) {
  const { org, project: slug } = await params;
  const context = await getProjectContext(org, slug);
  const [t, tPhases] = await Promise.all([getTranslations("projects"), getTranslations("projects.phases")]);
  const base = `/${org}/projects/${slug}`;

  return (
    <div className="mb-6 grid gap-4">
      <nav aria-label={t("breadcrumb")} className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={`/${org}/projects`} className="hover:text-foreground hover:underline">
              {t("list.title")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {context.project.name}
          </li>
        </ol>
      </nav>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{context.project.name}</h1>
        <Badge variant="secondary">{tPhases(context.project.phase)}</Badge>
      </div>
      <nav aria-label={t("tabs.label")} className="flex flex-wrap gap-1 border-b pb-2">
        <NavLink href={base} exact>
          {t("tabs.overview")}
        </NavLink>
        <NavLink href={`${base}/units`}>{t("tabs.units")}</NavLink>
        <NavLink href={`${base}/selectors`}>{t("tabs.selectors")}</NavLink>
        <NavLink href={`${base}/site`}>{t("tabs.site")}</NavLink>
        {can(context.role, "leads.read") ? <NavLink href={`${base}/leads`}>{t("tabs.leads")}</NavLink> : null}
        {can(context.role, "content.edit") ? <NavLink href={`${base}/settings`}>{t("tabs.settings")}</NavLink> : null}
      </nav>
    </div>
  );
}

function ProjectHeaderSkeleton() {
  return (
    <div className="mb-6 grid gap-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-80" />
    </div>
  );
}

export default function ProjectLayout({ children, params }: LayoutProps<"/[org]/projects/[project]">) {
  return (
    <>
      <Suspense fallback={<ProjectHeaderSkeleton />}>
        <ProjectHeader params={params} />
      </Suspense>
      {children}
    </>
  );
}
