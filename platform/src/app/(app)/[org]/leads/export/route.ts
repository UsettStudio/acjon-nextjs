import { getTranslations } from "next-intl/server";

import { buildLeadsCsv } from "@/features/leads/export";
import { parseLeadFilters } from "@/features/leads/filters";
import { listLeadsForExport } from "@/features/leads/queries";
import { getCurrentUser, getMemberships } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/format";

/** Leads som CSV med filtrene fra listen. Samme tilgang som listen (RLS). */
export async function GET(request: Request, { params }: RouteContext<"/[org]/leads/export">) {
  const { org } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return new Response(null, { status: 401 });
  }
  const membership = (await getMemberships()).find((m) => m.organization.slug === org);
  if (!membership || !can(membership.role, "leads.read")) {
    return new Response(null, { status: 404 });
  }
  const filters = parseLeadFilters(new URL(request.url).searchParams);
  const [rows, t] = await Promise.all([listLeadsForExport(membership.organization.id, filters), getTranslations("leads")]);
  const csv = buildLeadsCsv(rows, {
    header: (column) => t(`csv.${column}`),
    status: (status) => t(`statuses.${status as "new"}`),
    source: (source) => t(`sources.${source as "site"}`),
    dateTime: (iso) => formatDateTime(iso),
    yes: t("csv.yes"),
    no: t("csv.no"),
  });
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
