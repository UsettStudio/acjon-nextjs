import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { leadFilterParams, LEADS_PAGE_SIZE, type LeadFilters } from "@/features/leads/filters";
import { LeadsFilterBar } from "@/features/leads/components/leads-filter-bar";
import { LeadsTable } from "@/features/leads/components/leads-table";
import type { LeadListItem } from "@/features/leads/queries";

/** Filter, tabell og sidevalg. Brukes både i organisasjonens og prosjektets leadsliste. */
export async function LeadsListView({
  orgSlug,
  basePath,
  filters,
  leads,
  total,
  projects,
  units,
  showProject,
}: {
  orgSlug: string;
  /** Adressen til listen, for sidevalget. */
  basePath: string;
  filters: LeadFilters;
  leads: LeadListItem[];
  total: number;
  projects?: { id: string; name: string }[];
  units?: { id: string; unitNumber: string }[];
  showProject: boolean;
}) {
  const t = await getTranslations("leads.list");
  const pages = Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE));
  const first = (filters.page - 1) * LEADS_PAGE_SIZE + 1;
  const last = Math.min(total, filters.page * LEADS_PAGE_SIZE);
  const pageHref = (page: number) => {
    const params = leadFilterParams({ ...filters, page });
    return params.size > 0 ? `${basePath}?${params}` : basePath;
  };
  const filtered = Boolean(filters.status || filters.search || filters.unitId || (showProject && filters.projectId));

  return (
    <div className="grid gap-4">
      <LeadsFilterBar filters={filters} exportHref={`/${orgSlug}/leads/export`} projects={projects} units={units} />
      {total === 0 ? (
        <div className="rounded-md border border-dashed px-6 py-12 text-center">
          <p className="font-medium">{filtered ? t("noMatches") : t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{filtered ? t("noMatchesHelp") : t("emptyHelp")}</p>
        </div>
      ) : (
        <>
          <LeadsTable leads={leads} orgSlug={orgSlug} showProject={showProject} />
          <nav aria-label={t("pagination")} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground" aria-live="polite">
              {t("showing", { first, last, total })}
            </p>
            {pages > 1 ? (
              <div className="flex gap-2">
                {filters.page > 1 ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={pageHref(filters.page - 1)}>{t("previous")}</Link>
                  </Button>
                ) : null}
                {filters.page < pages ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={pageHref(filters.page + 1)}>{t("next")}</Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </nav>
        </>
      )}
    </div>
  );
}
