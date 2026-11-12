"use client";

import { DownloadIcon, SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { leadFilterParams, type LeadFilters } from "@/features/leads/filters";
import { LEAD_STATUSES, type LeadStatus } from "@/features/leads/schemas";

const ALL = "__all";

/** Filter for leadslisten. Filtrene ligger i adressen og brukes også av eksporten. */
export function LeadsFilterBar({
  filters,
  exportHref,
  projects,
  units,
}: {
  filters: LeadFilters;
  /** Adressen til eksporten uten filtre. Filtrene legges til her. */
  exportHref: string;
  /** Prosjektvalg (bare i organisasjonens leadsliste). */
  projects?: { id: string; name: string }[];
  /** Enhetsvalg (bare i prosjektets leadsliste). */
  units?: { id: string; unitNumber: string }[];
}) {
  const t = useTranslations("leads.filters");
  const tStatuses = useTranslations("leads.statuses");
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(filters.search);
  const [pending, startTransition] = useTransition();

  function apply(next: Partial<LeadFilters>) {
    const params = leadFilterParams({ ...filters, ...next, page: 1 });
    startTransition(() => router.replace(params.size > 0 ? `${pathname}?${params}` : pathname));
  }

  const active = Boolean(filters.status || filters.projectId || filters.unitId || filters.search);
  const exportParams = leadFilterParams({ ...filters, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3" aria-busy={pending}>
      <form
        role="search"
        className="relative min-w-56 flex-1 sm:max-w-sm"
        onSubmit={(event) => {
          event.preventDefault();
          apply({ search: search.trim() });
        }}
      >
        <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label={t("search")}
          placeholder={t("search")}
          value={search}
          maxLength={100}
          className="pl-9"
          onChange={(event) => setSearch(event.target.value)}
          onBlur={() => {
            if (search.trim() !== filters.search) {
              apply({ search: search.trim() });
            }
          }}
        />
      </form>
      <Select value={filters.status ?? ALL} onValueChange={(value) => apply({ status: value === ALL ? null : (value as LeadStatus) })}>
        <SelectTrigger aria-label={t("status")} className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allStatuses")}</SelectItem>
          {LEAD_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {tStatuses(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {projects && projects.length > 1 ? (
        <Select value={filters.projectId ?? ALL} onValueChange={(value) => apply({ projectId: value === ALL ? null : value, unitId: null })}>
          <SelectTrigger aria-label={t("project")} className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allProjects")}</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {units && units.length > 0 ? (
        <Select value={filters.unitId ?? ALL} onValueChange={(value) => apply({ unitId: value === ALL ? null : value })}>
          <SelectTrigger aria-label={t("unit")} className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allUnits")}</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.unitNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {active ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setSearch("");
            apply({ status: null, projectId: null, unitId: null, search: "" });
          }}
        >
          <XIcon aria-hidden="true" />
          {t("clear")}
        </Button>
      ) : null}
      <Button asChild variant="outline" className="ml-auto">
        <a href={exportParams.size > 0 ? `${exportHref}?${exportParams}` : exportHref} download>
          <DownloadIcon aria-hidden="true" />
          {t("export")}
        </a>
      </Button>
    </div>
  );
}
