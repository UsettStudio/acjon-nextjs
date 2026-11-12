import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CreateSite } from "@/features/site-builder/components/editor/create-site";
import { SiteEditor } from "@/features/site-builder/components/editor/site-editor";
import { getProjectContext } from "@/features/projects/queries";
import { getSiteEditorData } from "@/features/site-builder/queries";
import { can } from "@/lib/auth/permissions";

export async function generateMetadata({ params }: PageProps<"/[org]/projects/[project]/site">): Promise<Metadata> {
  const { org, project } = await params;
  const [context, t] = await Promise.all([getProjectContext(org, project), getTranslations("siteBuilder")]);
  return { title: t("pageTitle", { project: context.project.name }) };
}

export default async function ProjectSitePage({ params }: PageProps<"/[org]/projects/[project]/site">) {
  const { org, project: slug } = await params;
  const context = await getProjectContext(org, slug);
  const data = await getSiteEditorData(context.organization.id, context.project.id);
  if (!data) {
    return (
      <CreateSite
        organizationId={context.organization.id}
        projectId={context.project.id}
        defaultSubdomain={context.project.slug}
        canEdit={context.canEditContent}
      />
    );
  }
  return (
    <SiteEditor
      organizationId={context.organization.id}
      orgSlug={org}
      projectId={context.project.id}
      data={data}
      canEdit={context.canEditContent}
      canEditBrand={context.writable && can(context.role, "organization.update")}
    />
  );
}
