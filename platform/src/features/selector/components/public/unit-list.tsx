"use client";

import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon, HeartIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useUnitFormat } from "@/features/selector/components/public/use-unit-format";
import { STATUS_ORDER, type PublicUnit } from "@/features/selector/model";
import { compareUnitNumbers, type UnitStatus } from "@/features/units/fields";
import { cn } from "@/lib/utils";

export type SortKey = "unit" | "floor" | "rooms" | "area" | "price" | "status";

/** Tomme verdier havner sist uansett retning. */
function compareNullable(a: number | null, b: number | null, direction: 1 | -1): number {
  if (a === null && b === null) {
    return 0;
  }
  if (a === null) {
    return 1;
  }
  if (b === null) {
    return -1;
  }
  return (a - b) * direction;
}

export function sortUnits(units: readonly PublicUnit[], key: SortKey, direction: 1 | -1): PublicUnit[] {
  const statusRank = (status: UnitStatus) => STATUS_ORDER.indexOf(status);
  return [...units].sort((a, b) => {
    let result = 0;
    switch (key) {
      case "unit":
        result = compareUnitNumbers(a.unit_number, b.unit_number) * direction;
        break;
      case "floor":
        result = compareNullable(a.floor, b.floor, direction);
        break;
      case "rooms":
        result = compareNullable(a.rooms, b.rooms, direction);
        break;
      case "area":
        result = compareNullable(a.bra_i, b.bra_i, direction);
        break;
      case "price":
        result = compareNullable(a.price_hidden ? null : a.price, b.price_hidden ? null : b.price, direction);
        break;
      case "status":
        result = (statusRank(a.status) - statusRank(b.status)) * direction;
        break;
    }
    return result !== 0 ? result : compareUnitNumbers(a.unit_number, b.unit_number);
  });
}

export function UnitList({
  units,
  statusColors,
  highlightedUnitId,
  favorites,
  onHoverUnit,
  onOpen,
  onToggleFavorite,
}: {
  units: PublicUnit[];
  statusColors: Record<UnitStatus, string>;
  highlightedUnitId: string | null;
  favorites: ReadonlySet<string>;
  onHoverUnit: (unitId: string | null) => void;
  onOpen: (unit: PublicUnit) => void;
  onToggleFavorite: (unitId: string) => void;
}) {
  const t = useTranslations("publicSelector.list");
  const tStatus = useTranslations("unitStatus");
  const formatUnit = useUnitFormat();
  const [sort, setSort] = useState<{ key: SortKey; direction: 1 | -1 }>({ key: "unit", direction: 1 });
  const sorted = sortUnits(units, sort.key, sort.direction);

  // På smale skjermer vises areal under enhetsnummeret og status under prisen, så tabellen ikke må rulles sidelengs.
  const columns: { key: SortKey; label: string; className?: string }[] = [
    { key: "unit", label: t("unit") },
    { key: "floor", label: t("floor"), className: "hidden sm:table-cell" },
    { key: "rooms", label: t("rooms") },
    { key: "area", label: t("area"), className: "hidden sm:table-cell" },
    { key: "price", label: t("price") },
    { key: "status", label: t("status"), className: "hidden sm:table-cell" },
  ];

  if (units.length === 0) {
    return <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm" data-testid="selector-unit-list">
        <caption className="sr-only">{t("caption")}</caption>
        <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
          <tr>
            {columns.map((column) => {
              const active = sort.key === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={cn("px-2 py-2 font-medium", column.className)}
                  aria-sort={active ? (sort.direction === 1 ? "ascending" : "descending") : "none"}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onClick={() => setSort((current) => ({ key: column.key, direction: current.key === column.key ? (current.direction === 1 ? -1 : 1) : 1 }))}
                  >
                    {column.label}
                    {active ? (
                      sort.direction === 1 ? (
                        <ArrowUpIcon className="size-3" aria-hidden="true" />
                      ) : (
                        <ArrowDownIcon className="size-3" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDownIcon className="size-3 opacity-40" aria-hidden="true" />
                    )}
                  </button>
                </th>
              );
            })}
            <th scope="col" className="w-10 px-2 py-2">
              <span className="sr-only">{t("favorite")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((unit) => {
            const favorite = favorites.has(unit.id);
            return (
              <tr
                key={unit.id}
                data-unit-number={unit.unit_number}
                data-status={unit.status}
                className={cn("cursor-pointer border-t transition-colors hover:bg-accent/60", highlightedUnitId === unit.id && "bg-accent")}
                onPointerEnter={() => onHoverUnit(unit.id)}
                onPointerLeave={() => onHoverUnit(null)}
                onClick={() => onOpen(unit)}
              >
                <th scope="row" className="px-2 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="rounded outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onFocus={() => onHoverUnit(unit.id)}
                    onBlur={() => onHoverUnit(null)}
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpen(unit);
                    }}
                  >
                    {unit.unit_number}
                  </button>
                  <span className="block text-xs font-normal text-muted-foreground sm:hidden">{formatUnit.area(unit.bra_i)}</span>
                </th>
                <td className="hidden px-2 py-2 tabular-nums sm:table-cell">{unit.floor ?? "–"}</td>
                <td className="px-2 py-2 tabular-nums">{unit.rooms ?? "–"}</td>
                <td className="hidden px-2 py-2 whitespace-nowrap tabular-nums sm:table-cell">{formatUnit.area(unit.bra_i)}</td>
                <td className="px-2 py-2 whitespace-nowrap tabular-nums">
                  {formatUnit.price(unit)}
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs sm:hidden">
                    <span className="size-2 rounded-full" style={{ backgroundColor: statusColors[unit.status] }} aria-hidden="true" />
                    {tStatus(unit.status)}
                  </span>
                </td>
                <td className="hidden px-2 py-2 sm:table-cell">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap" data-testid="unit-status">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: statusColors[unit.status] }} aria-hidden="true" />
                    {tStatus(unit.status)}
                  </span>
                </td>
                <td className="px-1 py-1">
                  <button
                    type="button"
                    aria-pressed={favorite}
                    aria-label={favorite ? t("removeFavorite", { unit: unit.unit_number }) : t("addFavorite", { unit: unit.unit_number })}
                    className="rounded p-1.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleFavorite(unit.id);
                    }}
                  >
                    <HeartIcon className={cn("size-4", favorite && "fill-rose-500 text-rose-500")} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
