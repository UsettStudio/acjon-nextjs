import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/admin/page-header";
import { ProjectWizard } from "@/features/projects/components/project-wizard";
import { listMemberOptions } from "@/features/projects/queries";
import { can } from "@/lib/auth/permissions";
import { getOrgContext } from "@/lib/auth/dal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects.wizard");
  return { title: t("title") };
}

export default async function NewProjectPage({ params }: PageProps<"/[org]/projects/new">) {
  const { org } = await params;
  const context = await getOrgContext(org);
  if (!context.writable || !can(context.role, "projects.create")) {
    notFound();
  }
  const [t, members] = await Promise.all([
    getTranslations("projects.wizard"),
    listMemberOptions(context.organization.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title={t("title")} description={t("pageDescription")} />
      <ProjectWizard organizationId={context.organization.id} organizationSlug={org} members={members} />
    </div>
  );
}
