import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getProjectContext } from "@/features/projects/queries";
import { SelectorEditor } from "@/features/selector/components/editor/selector-editor";
import { getSelectorEditorData } from "@/features/selector/queries";

export async function generateMetadata({ params }: PageProps<"/[org]/projects/[project]/selectors/[selector]">): Promise<Metadata> {
  const { org, project, selector } = await params;
  const context = await getProjectContext(org, project);
  const [data, t] = await Promise.all([
    getSelectorEditorData(context.organization.id, context.project.id, selector),
    getTranslations("selector.editor"),
  ]);
  return { title: data ? t("pageTitle", { name: data.selector.name }) : undefined };
}

export default async function SelectorEditorPage({ params }: PageProps<"/[org]/projects/[project]/selectors/[selector]">) {
  const { org, project: slug, selector: selectorId } = await params;
  const context = await getProjectContext(org, slug);
  const data = await getSelectorEditorData(context.organization.id, context.project.id, selectorId);
  if (!data) {
    notFound();
  }
  return (
    <SelectorEditor
      organizationId={context.organization.id}
      orgSlug={org}
      projectId={context.project.id}
      projectSlug={slug}
      data={data}
      canEdit={context.canEditContent}
      canSell={context.canSell}
    />
  );
}
