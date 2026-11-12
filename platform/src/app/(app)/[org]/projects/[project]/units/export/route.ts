import { getTranslations } from "next-intl/server";

import { getProjectBySlug, getProjectStructure } from "@/features/projects/queries";
import { buildUnitsCsv, type ExportColumn } from "@/features/units/export";
import { getCurrentUser, getMemberships } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

/** Laster ned prosjektets enheter som CSV. Samme tilgang som enhetstabellen (RLS). */
export async function GET(_request: Request, { params }: RouteContext<"/[org]/projects/[project]/units/export">) {
  const { org, project: slug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return new Response(null, { status: 401 });
  }
  const membership = (await getMemberships()).find((m) => m.organization.slug === org);
  const project = membership ? await getProjectBySlug(membership.organization.id, slug) : null;
  if (!project) {
    return new Response(null, { status: 404 });
  }

  const supabase = await createClient();
  const [{ data: units, error }, structure, t] = await Promise.all([
    supabase
      .from("units")
      .select(
        "unit_number, title, unit_type, status, stage_id, building_id, floor, rooms, bedrooms, bathrooms, bra_i, bra_e, bra_b, tba, plot_area, price, purchase_costs, shared_debt, monthly_fee, ownership_type, orientation, parking, storage, description, external_id, is_hidden",
      )
      .eq("project_id", project.id)
      .order("sort_order")
      .order("unit_number")
      .limit(5000),
    getProjectStructure(project.id),
    getTranslations("units"),
  ]);
  if (error) {
    throw error;
  }

  const csv = buildUnitsCsv(
    units,
    {
      header: (column: ExportColumn) => t(`csv.${column}`),
      status: (status) => t(`status.values.${status}`),
      type: (type) => t(`types.${type}`),
      ownership: (ownership) => t(`ownership.${ownership}`),
      yes: t("csv.yes"),
      no: t("csv.no"),
    },
    {
      stages: new Map(structure.stages.map((stage) => [stage.id, stage.name])),
      buildings: new Map(structure.buildings.map((building) => [building.id, building.name])),
    },
  );
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${project.slug}-enheter-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
