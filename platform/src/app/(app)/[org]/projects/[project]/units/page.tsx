import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getProjectContext, getProjectStructure } from "@/features/projects/queries";
import { ImportUnitsButton } from "@/features/units/import/components/import-dialog";
import { UnitsTable } from "@/features/units/components/table/units-table";
import { listUnits } from "@/features/units/queries";

export async function generateMetadata({ params }: PageProps<"/[org]/projects/[project]/units">): Promise<Metadata> {
  const { org, project } = await params;
  const [context, t] = await Promise.all([getProjectContext(org, project), getTranslations("units.table")]);
  return { title: t("pageTitle", { name: context.project.name }) };
}

export default async function UnitsPage({ params }: PageProps<"/[org]/projects/[project]/units">) {
  const { org, project: slug } = await params;
  const context = await getProjectContext(org, slug);
  const [units, structure] = await Promise.all([listUnits(context.project.id), getProjectStructure(context.project.id)]);

  return (
    <UnitsTable
      organizationId={context.organization.id}
      orgSlug={org}
      projectId={context.project.id}
      projectSlug={slug}
      projectName={context.project.name}
      units={units}
      stages={structure.stages}
      buildings={structure.buildings}
      canEditContent={context.canEditContent}
      canSell={context.canSell}
      importButton={
        context.canEditContent ? (
          <ImportUnitsButton
            organizationId={context.organization.id}
            projectId={context.project.id}
            existingUnitNumbers={units.map((unit) => unit.unit_number)}
          />
        ) : null
      }
    />
  );
}
