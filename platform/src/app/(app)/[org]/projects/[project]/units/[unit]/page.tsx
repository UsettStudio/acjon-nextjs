import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssetsByIds } from "@/features/media/assets";
import { getProjectContext, getProjectStructure } from "@/features/projects/queries";
import { UnitForm } from "@/features/units/components/unit-form";
import { UnitStatusBadge } from "@/features/units/components/unit-status-badge";
import { getUnit, listUnitStatusEvents } from "@/features/units/queries";
import { formatDateTime } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/[org]/projects/[project]/units/[unit]">): Promise<Metadata> {
  const { org, project, unit: unitId } = await params;
  const context = await getProjectContext(org, project);
  const unit = await getUnit(context.project.id, unitId);
  return { title: unit ? `${unit.unit_number} · ${context.project.name}` : context.project.name };
}

export default async function UnitPage({ params }: PageProps<"/[org]/projects/[project]/units/[unit]">) {
  const { org, project: slug, unit: unitId } = await params;
  const context = await getProjectContext(org, slug);
  const unit = await getUnit(context.project.id, unitId);
  if (!unit) {
    notFound();
  }
  const [structure, assets, events, t, tSources] = await Promise.all([
    getProjectStructure(context.project.id),
    getAssetsByIds(context.organization.id, [
      ...unit.floor_plan_asset_ids,
      ...unit.gallery_asset_ids,
      ...unit.document_asset_ids,
    ]),
    listUnitStatusEvents(unit.id, 20),
    getTranslations("units.history"),
    getTranslations("units.sources"),
  ]);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_20rem]">
      <UnitForm
        key={unit.updated_at}
        organizationId={context.organization.id}
        orgSlug={org}
        projectId={context.project.id}
        projectSlug={slug}
        unit={unit}
        stages={structure.stages}
        buildings={structure.buildings}
        assets={assets}
        canEditContent={context.canEditContent}
        canSell={context.canSell}
      />
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>
            <h2>{t("cardTitle")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <ol className="grid gap-3 text-sm">
              {events.map((event) => (
                <li key={event.id} className="grid gap-1 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {event.fromStatus ? <UnitStatusBadge status={event.fromStatus} /> : null}
                    <span aria-hidden="true">→</span>
                    <span className="sr-only">{t("to")}</span>
                    <UnitStatusBadge status={event.toStatus} />
                  </div>
                  <p className="text-muted-foreground">
                    {t("meta", {
                      name: event.changedBy ?? t("system"),
                      time: formatDateTime(event.createdAt),
                      source: tSources(event.source as "admin"),
                    })}
                  </p>
                  {event.note ? <p>«{event.note}»</p> : null}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
