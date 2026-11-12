"use client";

/* eslint-disable @next/next/no-img-element -- Første visning i boligvelgeren, ferdig WebP fra Storage. */

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { LeadForm } from "@/features/leads/components/lead-form";
import { FilterBar } from "@/features/selector/components/public/filter-bar";
import { PublicSelector } from "@/features/selector/components/public/public-selector";
import { UnitList } from "@/features/selector/components/public/unit-list";
import { useFavorites } from "@/features/selector/components/public/use-favorites";
import { useLiveUnits } from "@/features/selector/components/public/use-public-units";
import { filterOptions, matchesFilters, parseFilters, writeFilters } from "@/features/selector/filters";
import { FILTER_KEYS } from "@/features/selector/model";
import type { RenderBlockProps } from "@/features/site-builder/components/render/content-blocks";
import { BlockHeading, BlockSection, EditorHint } from "@/features/site-builder/components/render/primitives";
import { unitHref } from "@/features/site-builder/site";
import { imageSources, svgPoints } from "@/features/selector/components/hotspot-svg";

// -----------------------------------------------------------------------------
// Boligvelger
// -----------------------------------------------------------------------------

export function SelectorBlock({ block, data }: RenderBlockProps<"selector">) {
  const t = useTranslations("site.editor");
  const headingId = `${block.id}-heading`;
  const selector = block.props.selector_id ? data.selectors[block.props.selector_id] : undefined;
  // Bare velgere i samme prosjekt vises, selv om noen har limt inn en annen id.
  const valid = selector && selector.project.id === data.project.id;
  if (!valid) {
    return data.mode !== "published" ? (
      <BlockSection id={block.id}>
        <EditorHint>{block.props.selector_id ? t("selectorNotPublished") : t("emptySelector")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined} flushMobile>
      {block.props.heading ? (
        <div className="px-3 sm:px-0">
          <BlockHeading id={headingId}>{block.props.heading}</BlockHeading>
        </div>
      ) : null}
      {data.mode === "editor" ? (
        <SelectorPreviewCard data={data} selectorId={selector.id} />
      ) : (
        <div>
          <PublicSelector
            data={selector}
            preview={data.mode !== "published"}
            options={{
              embedded: true,
              showFilters: block.props.show_filters,
              showList: block.props.show_list,
              entryViewId: block.props.entry_view_id,
              unitBasePath: data.basePath,
              interest: true,
            }}
          />
        </div>
      )}
    </BlockSection>
  );
}

/**
 * I editoren vises første bilde i velgeren med markeringene, uten interaksjon.
 * Den fulle velgeren vises i forhåndsvisningen og på den publiserte siden.
 */
function SelectorPreviewCard({ data, selectorId }: { data: RenderBlockProps<"selector">["data"]; selectorId: string }) {
  const t = useTranslations("site.editor");
  const selector = data.selectors[selectorId];
  const view = selector?.views.find((item) => item.id === selector.entryViewId) ?? selector?.views[0];
  if (!selector || !view?.asset || !view.image_width || !view.image_height) {
    return <EditorHint>{t("selectorPreview")}</EditorHint>;
  }
  const sources = imageSources(view.asset);
  return (
    <figure className="px-3 sm:px-0">
      <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: `${view.image_width} / ${view.image_height}` }}>
        <img src={sources.src} srcSet={sources.srcSet} sizes="(min-width: 1024px) 60rem, 100vw" alt="" className="absolute inset-0 size-full" />
        <svg viewBox={`0 0 ${view.image_width} ${view.image_height}`} className="absolute inset-0 size-full" aria-hidden="true">
          {view.hotspots.map((hotspot) => {
            const unit = hotspot.target_type === "unit" ? selector.units.find((item) => item.id === hotspot.target_unit_id) : undefined;
            const color = unit ? selector.statusColors[unit.status] : "#ffffff";
            const points = svgPoints(hotspot.shape, hotspot.points, view.image_width ?? 1, view.image_height ?? 1);
            return <polygon key={hotspot.id} points={points} fill={color} fillOpacity={0.45} stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-sm opacity-70">{t("selectorPreview")}</figcaption>
    </figure>
  );
}

// -----------------------------------------------------------------------------
// Enhetsliste
// -----------------------------------------------------------------------------

export function UnitListBlock({ block, data }: RenderBlockProps<"unit_list">) {
  const t = useTranslations("site.editor");
  const headingId = `${block.id}-heading`;
  const searchParams = useSearchParams();
  const { units } = useLiveUnits(data.units, data.project.id, data.project.showPriceOnSold, data.mode === "published");
  const { favorites, toggle } = useFavorites(data.project.id);
  const filters = useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams]);
  const visibleUnits = block.props.hide_sold ? units.filter((unit) => unit.status !== "sold") : units;
  const filtered = visibleUnits.filter((unit) => matchesFilters(unit, filters, FILTER_KEYS, favorites));
  const choices = useMemo(() => filterOptions(visibleUnits), [visibleUnits]);

  if (visibleUnits.length === 0) {
    return data.mode !== "published" ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("emptyUnits")}</EditorHint>
      </BlockSection>
    ) : null;
  }

  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined}>
      {block.props.heading ? <BlockHeading id={headingId}>{block.props.heading}</BlockHeading> : null}
      <div className="grid gap-4 text-neutral-900 [&_table]:bg-white">
        {block.props.show_filters ? (
          <FilterBar
            filters={filters}
            enabled={FILTER_KEYS}
            options={choices}
            statusColors={data.statusColors}
            favoritesCount={favorites.size}
            shown={filtered.length}
            total={visibleUnits.length}
            onChange={(next) => {
              const query = writeFilters(next, new URLSearchParams(searchParams.toString())).toString();
              window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
            }}
          />
        ) : null}
        <UnitList
          units={filtered}
          statusColors={data.statusColors}
          highlightedUnitId={null}
          favorites={favorites}
          onHoverUnit={() => undefined}
          onOpen={(unit) => {
            if (data.mode === "published") {
              window.location.assign(unitHref(data.basePath, unit.slug));
            }
          }}
          onToggleFavorite={toggle}
        />
      </div>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Interesseskjema
// -----------------------------------------------------------------------------

export function LeadFormBlock({ block, data }: RenderBlockProps<"lead_form">) {
  const headingId = `${block.id}-heading`;
  const t = useTranslations("site.lead");
  const units = data.units
    .filter((unit) => unit.status !== "sold")
    .map((unit) => ({ id: unit.id, label: unit.title ? `${unit.unit_number} – ${unit.title}` : unit.unit_number }));
  return (
    <BlockSection id={block.id} headingId={headingId} tone="muted">
      <div className="mx-auto max-w-3xl">
        <BlockHeading id={headingId}>{block.props.heading || t("defaultHeading")}</BlockHeading>
        {block.props.intro ? <p className="mb-6 text-lg">{block.props.intro}</p> : null}
        <LeadForm
          projectId={data.project.id}
          pageId={data.page?.id ?? null}
          units={units}
          defaultUnitId={null}
          showUnitSelect={block.props.show_unit_select}
          buttonLabel={block.props.button_label}
          source="site"
          organizationName={data.organization.name}
          projectName={data.project.name}
          locale={data.organization.locale}
          disabled={data.mode !== "published"}
        />
      </div>
    </BlockSection>
  );
}
