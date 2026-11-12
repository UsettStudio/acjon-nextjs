"use client";

import { HeartIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasActiveFilters, type Range, type SelectorFilters } from "@/features/selector/filters";
import { STATUS_ORDER, type FilterKey } from "@/features/selector/model";
import type { UnitStatus } from "@/features/units/fields";
import { cn } from "@/lib/utils";

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
        pressed && "border-foreground bg-foreground text-background hover:bg-foreground/90",
      )}
    >
      {children}
    </button>
  );
}

function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** Fra- og til-felt. Verdien brukes når feltet forlates eller Enter trykkes, så adressen ikke endres for hvert tastetrykk. */
function RangeInput({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: Range;
  onChange: (range: Range) => void;
}) {
  const t = useTranslations("publicSelector.filters");
  const id = useId();
  const [draft, setDraft] = useState({ min: value.min?.toString() ?? "", max: value.max?.toString() ?? "" });
  const [synced, setSynced] = useState(value);
  // Nytt filter fra adressen (tilbakeknapp, nullstilling): vis det i feltene.
  if (synced.min !== value.min || synced.max !== value.max) {
    setSynced(value);
    setDraft({ min: value.min?.toString() ?? "", max: value.max?.toString() ?? "" });
  }

  function commit() {
    const toNumber = (raw: string) => {
      const cleaned = raw.replace(/[\s ]/g, "").replace(",", ".");
      if (cleaned === "") {
        return null;
      }
      const number = Number(cleaned);
      return Number.isFinite(number) && number >= 0 ? number : null;
    };
    let min = toNumber(draft.min);
    let max = toNumber(draft.max);
    if (min !== null && max !== null && min > max) {
      [min, max] = [max, min];
    }
    if (min !== value.min || max !== value.max) {
      onChange({ min, max });
    }
  }

  return (
    <fieldset className="grid gap-1">
      <legend className="text-xs font-medium text-muted-foreground">
        {label} ({unit})
      </legend>
      <div className="flex items-center gap-1.5">
        <label htmlFor={`${id}-min`} className="sr-only">
          {t("from", { label })}
        </label>
        <Input
          id={`${id}-min`}
          inputMode="numeric"
          placeholder={t("min")}
          value={draft.min}
          onChange={(event) => setDraft((current) => ({ ...current, min: event.target.value }))}
          onBlur={commit}
          onKeyDown={(event) => event.key === "Enter" && commit()}
          className="h-8 w-28"
        />
        <span aria-hidden="true">–</span>
        <label htmlFor={`${id}-max`} className="sr-only">
          {t("to", { label })}
        </label>
        <Input
          id={`${id}-max`}
          inputMode="numeric"
          placeholder={t("max")}
          value={draft.max}
          onChange={(event) => setDraft((current) => ({ ...current, max: event.target.value }))}
          onBlur={commit}
          onKeyDown={(event) => event.key === "Enter" && commit()}
          className="h-8 w-28"
        />
      </div>
    </fieldset>
  );
}

export function FilterBar({
  filters,
  enabled,
  options,
  statusColors,
  favoritesCount,
  shown,
  total,
  onChange,
}: {
  filters: SelectorFilters;
  enabled: readonly FilterKey[];
  options: { rooms: number[]; floors: number[] };
  statusColors: Record<UnitStatus, string>;
  favoritesCount: number;
  shown: number;
  total: number;
  onChange: (filters: SelectorFilters) => void;
}) {
  const t = useTranslations("publicSelector.filters");
  const tStatus = useTranslations("unitStatus");
  const [open, setOpen] = useState(false);
  const active = hasActiveFilters(filters);
  const on = (key: FilterKey) => enabled.includes(key);
  const panelId = useId();

  return (
    <section aria-label={t("label")} className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite" data-testid="selector-count">
          {t("showing", { shown, total })}
        </p>
        <div className="flex items-center gap-2">
          {active ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...filters, status: [], rooms: [], floor: [], price: { min: null, max: null }, area: { min: null, max: null }, favorites: false })}>
              <XIcon aria-hidden="true" />
              {t("reset")}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="lg:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <SlidersHorizontalIcon aria-hidden="true" />
            {t("toggle")}
          </Button>
        </div>
      </div>
      <div id={panelId} className={cn("flex-wrap items-end gap-x-6 gap-y-3", open ? "flex" : "hidden lg:flex")}>
        {on("status") ? (
          <fieldset className="grid gap-1">
            <legend className="text-xs font-medium text-muted-foreground">{t("status")}</legend>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((status) => (
                <Chip key={status} pressed={filters.status.includes(status)} onClick={() => onChange({ ...filters, status: toggle(filters.status, status) })}>
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: statusColors[status] }} aria-hidden="true" />
                  {tStatus(status)}
                </Chip>
              ))}
            </div>
          </fieldset>
        ) : null}
        {on("rooms") && options.rooms.length > 0 ? (
          <fieldset className="grid gap-1">
            <legend className="text-xs font-medium text-muted-foreground">{t("rooms")}</legend>
            <div className="flex flex-wrap gap-1.5">
              {options.rooms.map((rooms) => (
                <Chip key={rooms} pressed={filters.rooms.includes(rooms)} onClick={() => onChange({ ...filters, rooms: toggle(filters.rooms, rooms).sort((a, b) => a - b) })}>
                  {t("roomsOption", { rooms })}
                </Chip>
              ))}
            </div>
          </fieldset>
        ) : null}
        {on("floor") && options.floors.length > 0 ? (
          <fieldset className="grid gap-1">
            <legend className="text-xs font-medium text-muted-foreground">{t("floor")}</legend>
            <div className="flex flex-wrap gap-1.5">
              {options.floors.map((floor) => (
                <Chip key={floor} pressed={filters.floor.includes(floor)} onClick={() => onChange({ ...filters, floor: toggle(filters.floor, floor).sort((a, b) => a - b) })}>
                  {floor}
                </Chip>
              ))}
            </div>
          </fieldset>
        ) : null}
        {on("price") ? <RangeInput label={t("price")} unit="kr" value={filters.price} onChange={(price) => onChange({ ...filters, price })} /> : null}
        {on("area") ? <RangeInput label={t("area")} unit="m²" value={filters.area} onChange={(area) => onChange({ ...filters, area })} /> : null}
        <Chip pressed={filters.favorites} onClick={() => onChange({ ...filters, favorites: !filters.favorites })}>
          <HeartIcon className={cn("size-4", filters.favorites && "fill-current")} aria-hidden="true" />
          {t("favorites", { count: favoritesCount })}
        </Chip>
      </div>
    </section>
  );
}
