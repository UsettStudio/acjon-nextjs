"use client";

import { ChevronLeftIcon, ChevronRightIcon, ScaleIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { CompareDialog, MAX_COMPARE } from "@/features/selector/components/public/compare-dialog";
import { FilterBar } from "@/features/selector/components/public/filter-bar";
import { SelectorStage, type HotspotAction } from "@/features/selector/components/public/selector-stage";
import { UnitCard } from "@/features/selector/components/public/unit-card";
import { setLocationSearch, useLocationSearch } from "@/features/selector/components/public/use-location-search";
import { UnitList } from "@/features/selector/components/public/unit-list";
import { useFavorites } from "@/features/selector/components/public/use-favorites";
import { useLiveUnits, type LiveState } from "@/features/selector/components/public/use-public-units";
import { filterOptions, hasActiveFilters, matchesFilters, parseFilters, writeFilters, type SelectorFilters } from "@/features/selector/filters";
import { STATUS_ORDER, type PublicHotspot, type PublishedSelector, type PublicUnit } from "@/features/selector/model";
import { selectorUnitPath } from "@/features/selector/paths";
import { angleSiblings, flattenViews, viewPath } from "@/features/selector/views";
import { siteUrl } from "@/features/site-builder/site";
import { publicEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

const VIEW_PARAM = "visning";

function LiveIndicator({ state }: { state: LiveState }) {
  const t = useTranslations("publicSelector.live");
  if (state === "disabled") {
    return null;
  }
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite" data-live={state} data-testid="selector-live">
      <span
        className={cn("size-2 rounded-full", state === "live" ? "bg-emerald-500" : state === "connecting" ? "bg-amber-400" : "bg-slate-400")}
        aria-hidden="true"
      />
      {t(state)}
    </p>
  );
}

export type PublicSelectorOptions = {
  /** Vis filtre (standard: innstillingen i velgeren). */
  showFilters?: boolean;
  /** Vis enhetslisten (standard: innstillingen i velgeren). */
  showList?: boolean;
  /** Start i en annen visning enn velgerens startvisning. */
  entryViewId?: string | null;
  /**
   * Start på adressen til enhetssidene: «{unitBasePath}/bolig/{slug}». Brukes på
   * prosjektsiden. Uten den lenker velgeren til enhetssiden under seg selv.
   */
  unitBasePath?: string;
  /** Vis «Meld interesse», som går til interesseskjemaet på enhetssiden. */
  interest?: boolean;
  /** Velgeren ligger på en prosjektside: ingen egen overskrift med prosjektnavn. */
  embedded?: boolean;
  /** Velgeren står lenger ned på siden: bildet lastes først når det nærmer seg skjermen. */
  lazyImage?: boolean;
};

export function PublicSelector({
  data,
  preview = false,
  options = {},
}: {
  data: PublishedSelector;
  preview?: boolean;
  options?: PublicSelectorOptions;
}) {
  const t = useTranslations("publicSelector");
  const tStatus = useTranslations("unitStatus");
  const searchParams = useLocationSearch();
  const { units, live } = useLiveUnits(data.units, data.project.id, data.project.show_price_on_sold, !preview);
  const { favorites, toggle: toggleFavorite } = useFavorites(data.project.id);
  const [hovered, setHovered] = useState<string | null>(null);
  const [openUnitId, setOpenUnitId] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const listMode = options.showList === false ? "hidden" : options.showList === true && data.settings.list === "hidden" ? "side" : data.settings.list;
  const showFilters = options.showFilters ?? true;
  const [mobilePanel, setMobilePanel] = useState<"list" | "image">(listMode === "hidden" ? "image" : "list");

  const nodes = useMemo(
    () => data.views.map((view) => ({ id: view.id, parentViewId: view.parent_view_id, sortOrder: view.sort_order, angleGroup: view.angle_group, view })),
    [data.views],
  );
  const viewsById = useMemo(() => new Map(data.views.map((view) => [view.id, view])), [data.views]);
  const preferredEntry = options.entryViewId && viewsById.has(options.entryViewId) ? options.entryViewId : data.entryViewId;
  const entryViewId = preferredEntry && viewsById.has(preferredEntry) ? preferredEntry : (flattenViews(nodes)[0]?.view.id ?? null);
  const requested = searchParams.get(VIEW_PARAM);
  const activeView = (requested ? viewsById.get(requested) : undefined) ?? (entryViewId ? viewsById.get(entryViewId) : undefined) ?? null;

  const unitsById = useMemo(() => new Map(units.map((unit) => [unit.id, unit])), [units]);
  const filters = useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams]);
  const filtered = units.filter((unit) => matchesFilters(unit, filters, data.settings.filters, favorites));
  const matching = hasActiveFilters(filters) ? new Set(filtered.map((unit) => unit.id)) : null;
  const filterChoices = useMemo(() => filterOptions(units), [units]);

  /** Visningene hver enhet er markert i, i treets rekkefølge. */
  const unitViews = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const { view } of flattenViews(nodes)) {
      for (const hotspot of view.view.hotspots) {
        if (hotspot.target_type === "unit" && hotspot.target_unit_id) {
          const list = map.get(hotspot.target_unit_id) ?? [];
          if (!list.includes(view.id)) {
            map.set(hotspot.target_unit_id, [...list, view.id]);
          }
        }
      }
    }
    return map;
  }, [nodes]);

  function navigate(params: URLSearchParams, push: boolean) {
    setLocationSearch(params, push ? "push" : "replace");
  }

  function goToView(viewId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (viewId === entryViewId) {
      params.delete(VIEW_PARAM);
    } else {
      params.set(VIEW_PARAM, viewId);
    }
    navigate(params, true);
    setHovered(null);
    setMobilePanel("image");
  }

  function updateFilters(next: SelectorFilters) {
    navigate(writeFilters(next, new URLSearchParams(searchParams.toString())), false);
  }

  const unitHref = (unit: PublicUnit) =>
    options.unitBasePath !== undefined ? `${options.unitBasePath}/bolig/${encodeURIComponent(unit.slug)}` : selectorUnitPath(data.id, unit.slug);
  const interestHref = options.interest ? (unit: PublicUnit) => `${unitHref(unit)}#interesse` : null;

  /** Prosjektsiden til et annet prosjekt. Databasen sender bare prosjekter med publisert prosjektside. */
  function projectUrl(project: PublishedSelector["linkedProjects"][number]): string | null {
    const env = publicEnv();
    return project.hostname || project.subdomain ? siteUrl(project.subdomain ?? "", project.hostname, env.platformDomain, env.appUrl) : null;
  }

  function hrefFor(hotspot: PublicHotspot): { href: string; external: boolean } | null {
    switch (hotspot.target_type) {
      case "unit": {
        const unit = hotspot.target_unit_id ? unitsById.get(hotspot.target_unit_id) : undefined;
        return unit ? { href: unitHref(unit), external: false } : null;
      }
      case "view":
        return hotspot.target_view_id && viewsById.has(hotspot.target_view_id) ? { href: `?${VIEW_PARAM}=${hotspot.target_view_id}`, external: false } : null;
      case "project": {
        const project = data.linkedProjects.find((item) => item.id === hotspot.target_project_id);
        const url = project ? projectUrl(project) : null;
        return url ? { href: url, external: true } : null;
      }
      case "url":
        return hotspot.target_url ? { href: hotspot.target_url, external: true } : null;
    }
  }

  function viewSummary(viewId: string) {
    const view = viewsById.get(viewId);
    if (!view) {
      return null;
    }
    const available = new Set(
      view.hotspots.flatMap((hotspot) =>
        hotspot.target_type === "unit" && hotspot.target_unit_id && unitsById.get(hotspot.target_unit_id)?.status === "available"
          ? [hotspot.target_unit_id]
          : [],
      ),
    );
    return { name: view.name, available: available.size };
  }

  function onAction(action: HotspotAction) {
    if (action.type === "unit") {
      setOpenUnitId(action.unit.id);
    } else if (action.type === "view") {
      goToView(action.viewId);
    }
  }

  const openUnit = openUnitId ? (unitsById.get(openUnitId) ?? null) : null;
  const openUnitViews = openUnit ? (unitViews.get(openUnit.id) ?? []) : [];
  const compareUnits = compare.flatMap((id) => (unitsById.get(id) ? [unitsById.get(id) as PublicUnit] : []));
  const path = activeView ? viewPath(nodes, activeView.id) : [];
  const angles = activeView ? angleSiblings(nodes, activeView.id) : [];
  const angleIndex = angles.findIndex((node) => node.id === activeView?.id);
  const parent = path.length > 1 ? path[path.length - 2] : undefined;
  const statusCounts = Object.fromEntries(STATUS_ORDER.map((status) => [status, units.filter((unit) => unit.status === status).length]));
  const address = [data.project.address, [data.project.postal_code, data.project.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return (
    <div className={cn("mx-auto grid w-full gap-4", options.embedded ? "max-w-none" : "max-w-[110rem] p-3 sm:p-6")}>
      {preview ? (
        <p className="rounded-md border border-amber-500/50 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {t("previewBanner")}
        </p>
      ) : null}
      {options.embedded ? (
        <div className="flex justify-end">
          <LiveIndicator state={live} />
        </div>
      ) : (
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="site-heading text-xl font-semibold tracking-tight sm:text-2xl">{data.project.name}</h1>
            {address ? <p className="text-sm text-muted-foreground">{address}</p> : null}
          </div>
          <LiveIndicator state={live} />
        </header>
      )}

      {showFilters ? (
      <FilterBar
        filters={filters}
        enabled={data.settings.filters}
        options={filterChoices}
        statusColors={data.statusColors}
        favoritesCount={favorites.size}
        shown={filtered.length}
        total={units.length}
        onChange={updateFilters}
      />
      ) : null}

      {listMode !== "hidden" ? (
        <div role="tablist" aria-label={t("panels")} className="flex gap-1 self-start rounded-md bg-muted p-1 lg:hidden">
          {(["list", "image"] as const).map((panel) => (
            <button
              key={panel}
              type="button"
              role="tab"
              aria-selected={mobilePanel === panel}
              onClick={() => setMobilePanel(panel)}
              className={cn(
                "rounded px-4 py-1.5 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                mobilePanel === panel && "bg-background text-foreground shadow-sm",
              )}
            >
              {t(`panel.${panel}`)}
            </button>
          ))}
        </div>
      ) : null}

      <div className={cn("grid gap-4", listMode === "side" && "lg:grid-cols-[minmax(0,1fr)_minmax(26rem,34rem)] lg:items-start")}>
        <section aria-label={t("imageLabel")} className={cn("grid min-w-0 content-start gap-3", listMode !== "hidden" && mobilePanel === "list" && "max-lg:hidden")}>
          {path.length > 1 || angles.length > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <nav aria-label={t("breadcrumb")} className="flex flex-wrap items-center gap-1 text-sm">
                {parent ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => goToView(parent.id)}>
                    <ChevronLeftIcon aria-hidden="true" />
                    {t("back")}
                  </Button>
                ) : null}
                <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
                  {path.map((node, index) => (
                    <li key={node.id} className="flex items-center gap-1">
                      {index > 0 ? <span aria-hidden="true">/</span> : null}
                      {index === path.length - 1 ? (
                        <span aria-current="page" className="font-medium text-foreground">
                          {node.view.name}
                        </span>
                      ) : (
                        <a
                          href={node.id === entryViewId ? "?" : `?${VIEW_PARAM}=${node.id}`}
                          className="hover:text-foreground hover:underline"
                          onClick={(event) => {
                            event.preventDefault();
                            goToView(node.id);
                          }}
                        >
                          {node.view.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
              {angles.length > 1 ? (
                <div className="flex items-center gap-1" role="group" aria-label={t("angles")}>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    aria-label={t("previousAngle")}
                    onClick={() => goToView((angles[(angleIndex - 1 + angles.length) % angles.length] ?? angles[0])?.id ?? "")}
                  >
                    <ChevronLeftIcon aria-hidden="true" />
                  </Button>
                  {angles.map((node, index) => (
                    <Button
                      key={node.id}
                      type="button"
                      variant={node.id === activeView?.id ? "secondary" : "ghost"}
                      size="sm"
                      aria-pressed={node.id === activeView?.id}
                      onClick={() => goToView(node.id)}
                    >
                      {node.view.name || t("angle", { number: index + 1 })}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    aria-label={t("nextAngle")}
                    onClick={() => goToView((angles[(angleIndex + 1) % angles.length] ?? angles[0])?.id ?? "")}
                  >
                    <ChevronRightIcon aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {activeView ? (
            <SelectorStage
              key={activeView.id}
              view={activeView}
              unitsById={unitsById}
              statusColors={data.statusColors}
              hatchSold={data.settings.hatch_sold}
              matchingUnitIds={matching}
              highlightedUnitId={hovered}
              hrefFor={hrefFor}
              viewSummary={viewSummary}
              onHoverUnit={setHovered}
              onAction={onAction}
              lazyImage={options.lazyImage}
            />
          ) : (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{t("noViews")}</p>
          )}

          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label={t("legend")}>
            {STATUS_ORDER.map((status) => (
              <li key={status} className="flex items-center gap-1.5">
                <span
                  className="size-3.5 rounded-sm border-2"
                  style={{ backgroundColor: `${data.statusColors[status]}73`, borderColor: data.statusColors[status] }}
                  aria-hidden="true"
                />
                {tStatus(status)}
                <span className="text-muted-foreground tabular-nums">({statusCounts[status]})</span>
              </li>
            ))}
          </ul>
        </section>

        {listMode !== "hidden" ? (
          <section
            aria-label={t("listLabel")}
            className={cn("min-w-0", mobilePanel === "image" && "max-lg:hidden", listMode === "side" && "lg:max-h-[calc(78svh+5rem)] lg:overflow-y-auto")}
          >
            <UnitList
              units={filtered}
              statusColors={data.statusColors}
              highlightedUnitId={hovered}
              favorites={favorites}
              onHoverUnit={setHovered}
              onOpen={(unit) => setOpenUnitId(unit.id)}
              onToggleFavorite={toggleFavorite}
            />
          </section>
        ) : null}
      </div>

      {compareUnits.length > 0 ? (
        <div className="sticky bottom-3 z-20 mx-auto flex items-center gap-2 rounded-full border bg-background/95 px-3 py-2 shadow-lg">
          <span className="text-sm">{t("compareBar", { count: compareUnits.length, max: MAX_COMPARE })}</span>
          <Button type="button" size="sm" onClick={() => setCompareOpen(true)} disabled={compareUnits.length < 2}>
            <ScaleIcon aria-hidden="true" />
            {t("compareOpen")}
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t("compareClear")} onClick={() => setCompare([])}>
            <XIcon aria-hidden="true" />
          </Button>
        </div>
      ) : null}

      <UnitCard
        unit={openUnit}
        statusColors={data.statusColors}
        unitHref={preview ? null : unitHref}
        interestHref={preview ? null : interestHref}
        favorite={openUnit ? favorites.has(openUnit.id) : false}
        comparing={openUnit ? compare.includes(openUnit.id) : false}
        compareFull={compare.length >= MAX_COMPARE}
        canLocate={openUnitViews.length > 0 && !openUnitViews.includes(activeView?.id ?? "")}
        onClose={() => setOpenUnitId(null)}
        onToggleFavorite={() => openUnit && toggleFavorite(openUnit.id)}
        onToggleCompare={() =>
          openUnit &&
          setCompare((current) =>
            current.includes(openUnit.id) ? current.filter((id) => id !== openUnit.id) : current.length >= MAX_COMPARE ? current : [...current, openUnit.id],
          )
        }
        onLocate={() => {
          const target = openUnitViews[0];
          if (openUnit && target) {
            goToView(target);
            setHovered(openUnit.id);
            setOpenUnitId(null);
          }
        }}
      />
      <CompareDialog
        open={compareOpen && compareUnits.length > 0}
        onOpenChange={setCompareOpen}
        units={compareUnits}
        statusColors={data.statusColors}
        unitHref={preview ? null : unitHref}
        onRemove={(unitId) => setCompare((current) => current.filter((id) => id !== unitId))}
      />
    </div>
  );
}
