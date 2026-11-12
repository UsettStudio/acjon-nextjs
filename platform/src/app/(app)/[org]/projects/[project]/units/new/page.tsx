import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getProjectContext, getProjectStructure } from "@/features/projects/queries";
import { UnitForm } from "@/features/units/components/unit-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("units.form");
  return { title: t("newTitle") };
}

export default async function NewUnitPage({ params }: PageProps<"/[org]/projects/[project]/units/new">) {
  const { org, project: slug } = await params;
  const context = await getProjectContext(org, slug);
  if (!context.canEditContent) {
    notFound();
  }
  const structure = await getProjectStructure(context.project.id);
  return (
    <UnitForm
      organizationId={context.organization.id}
      orgSlug={org}
      projectId={context.project.id}
      projectSlug={slug}
      unit={null}
      stages={structure.stages}
      buildings={structure.buildings}
      assets={[]}
      canEditContent={context.canEditContent}
      canSell={context.canSell}
    />
  );
}
