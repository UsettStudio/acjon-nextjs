import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsIdsFormValues } from "@/features/projects/analytics";
import { AnalyticsIdsForm } from "@/features/projects/components/analytics-ids-form";
import { DeleteProject } from "@/features/projects/components/delete-project";
import {
  ProjectContactsForm,
  ProjectDetailsForm,
  ProjectLocationForm,
  ProjectMilestonesForm,
} from "@/features/projects/components/project-settings-forms";
import { StructureManager } from "@/features/projects/components/structure-manager";
import { getAnalyticsIds, getProjectContext, getProjectStructure, listMemberOptions } from "@/features/projects/queries";
import { StatusColorsForm } from "@/features/selector/components/status-colors-form";
import { resolveStatusColors } from "@/features/selector/model";
import { getDisplaySettings } from "@/features/selector/queries";
import { PublicCustomFieldsForm } from "@/features/units/components/public-custom-fields-form";
import { getPublicCustomFieldNames, listCustomFieldNames } from "@/features/units/queries";
import { can } from "@/lib/auth/permissions";

export async function generateMetadata({ params }: PageProps<"/[org]/projects/[project]/settings">): Promise<Metadata> {
  const { org, project } = await params;
  const [context, t] = await Promise.all([getProjectContext(org, project), getTranslations("projects.settings")]);
  return { title: t("pageTitle", { name: context.project.name }) };
}

export default async function ProjectSettingsPage({ params }: PageProps<"/[org]/projects/[project]/settings">) {
  const { org, project: slug } = await params;
  const context = await getProjectContext(org, slug);
  // Meglere har ikke innstillinger. I lesemodus vises skjemaene, men låst.
  if (!can(context.role, "content.edit")) {
    notFound();
  }
  const { project } = context;
  const [t, structure, members, display, customFieldNames, publicCustomFields, analyticsIds] = await Promise.all([
    getTranslations("projects.settings"),
    getProjectStructure(project.id),
    listMemberOptions(context.organization.id),
    getDisplaySettings(context.organization.id, project.id),
    listCustomFieldNames(project.id),
    getPublicCustomFieldNames(project.id),
    getAnalyticsIds(project.id),
  ]);
  const disabled = !context.canEditContent;
  const common = { organizationId: context.organization.id, project, disabled };

  return (
    <div className="grid max-w-5xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("general")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectDetailsForm {...common} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("location")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectLocationForm {...common} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("progress")}</h2>
          </CardTitle>
          <CardDescription>{t("progressHelp")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectMilestonesForm {...common} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("contacts")}</h2>
          </CardTitle>
          <CardDescription>{t("contactsHelp")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectContactsForm {...common} members={members} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("structure")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StructureManager
            organizationId={context.organization.id}
            projectId={project.id}
            stages={structure.stages}
            buildings={structure.buildings}
            disabled={disabled}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("display")}</h2>
          </CardTitle>
          <CardDescription>{t("displayHelp")}</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusColorsForm
            scope="project"
            organizationId={context.organization.id}
            projectId={project.id}
            initial={display.projectColors}
            inherited={resolveStatusColors(display.organizationColors, {})}
            showPriceOnSold={display.showPriceOnSold}
            disabled={disabled}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("tracking.title")}</h2>
          </CardTitle>
          <CardDescription>{t("tracking.help")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsIdsForm
            organizationId={context.organization.id}
            projectId={project.id}
            initial={analyticsIdsFormValues(analyticsIds)}
            disabled={disabled}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("customFields.title")}</h2>
          </CardTitle>
          <CardDescription>{t("customFields.help")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PublicCustomFieldsForm
            organizationId={context.organization.id}
            projectId={project.id}
            names={customFieldNames}
            initialPublic={publicCustomFields}
            disabled={disabled}
          />
        </CardContent>
      </Card>
      {context.canDelete ? (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>
              <h2>{t("dangerZone")}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeleteProject organizationId={context.organization.id} projectId={project.id} projectName={project.name} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
