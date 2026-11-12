"use client";

import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  metaHelper,
  rowSortingFeature,
  tableFeatures,
  type Row,
} from "@tanstack/react-table";
import { EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { useUnitsTable } from "@/features/units/components/table/context";
import { EditableCell, EmptyValue, type CellOption } from "@/features/units/components/table/editable-cell";
import { RowActions } from "@/features/units/components/table/row-actions";
import { StatusCell } from "@/features/units/components/table/status-cell";
import {
  compareUnitNumbers,
  numberFormatOf,
  OWNERSHIP_TYPES,
  UNIT_STATUSES,
  UNIT_TYPES,
  type UnitFieldKey,
  type UnitStatus,
} from "@/features/units/fields";
import { calculateTotals } from "@/features/units/price";
import type { UnitListItem } from "@/features/units/queries";
import { isSalesField, type EditableField } from "@/features/units/schemas";
import { formatArea, formatCurrency, formatDateTime, formatNumber } from "@/lib/format";

export type UnitColumnMeta = {
  label: string;
  align?: "start" | "end";
  /** Kolonner som ikke kan skjules (enhetsnummer og handlinger). */
  fixed?: boolean;
};

export const unitTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  columnVisibilityFeature,
  columnMeta: metaHelper<UnitColumnMeta>(),
});

type Features = typeof unitTableFeatures;
export type UnitTableRow = Row<Features, UnitListItem>;

const helper = createColumnHelper<Features, UnitListItem>();

/** Kolonner som er skjult til brukeren slår dem på i kolonnevelgeren. */
export const DEFAULT_HIDDEN_COLUMNS = [
  "title",
  "unit_type",
  "bathrooms",
  "bra_e",
  "bra_b",
  "tba",
  "plot_area",
  "shared_debt",
  "total_with_debt",
  "ownership_type",
  "orientation",
  "parking",
  "storage",
  "external_id",
  "is_hidden",
  "updated_at",
] as const;

const statusOrder = (status: UnitStatus) => UNIT_STATUSES.indexOf(status);

/** Tomme verdier sorteres sist, uansett retning (sortUndefined). */
const orUndefined = <T,>(value: T | null): T | undefined => (value === null ? undefined : value);

function formatValue(field: UnitFieldKey, value: number): string {
  switch (numberFormatOf(field)) {
    case "currency":
      return formatCurrency(value);
    case "area":
      return formatArea(value);
    default:
      return formatNumber(value);
  }
}

/** Verdien i redigeringsfeltet: norsk tallformat, så det som vises og det som redigeres er likt. */
function editText(field: UnitFieldKey, value: number | string | boolean | null): string {
  if (value === null) {
    return "";
  }
  if (typeof value === "number") {
    return formatNumber(value, "nb", numberFormatOf(field) === "area" ? 1 : 0);
  }
  return String(value);
}

export function useUnitColumns() {
  const t = useTranslations("units");
  const tTypes = useTranslations("units.types");
  const tOwnership = useTranslations("units.ownership");
  const tCommon = useTranslations("common");
  const { stages, buildings, canEditContent, canSell } = useUnitsTable();

  return useMemo(() => {
    const label = (key: string) => t(`fields.${key}` as "fields.price");
    const canEdit = (field: EditableField) => (isSalesField(field) ? canSell : canEditContent);
    const stageNames = new Map(stages.map((stage) => [stage.id, stage.name]));
    const buildingNames = new Map(buildings.map((building) => [building.id, building.name]));

    const numberColumn = (
      field: Extract<
        UnitFieldKey,
        | "floor"
        | "rooms"
        | "bedrooms"
        | "bathrooms"
        | "bra_i"
        | "bra_e"
        | "bra_b"
        | "tba"
        | "plot_area"
        | "price"
        | "purchase_costs"
        | "shared_debt"
        | "monthly_fee"
      >,
    ) =>
      helper.accessor((row) => orUndefined(row[field]), {
        id: field,
        sortUndefined: "last",
        meta: { label: label(field), align: "end" },
        cell: ({ row }) => {
          const value = row.original[field];
          return (
            <EditableCell
              unit={row.original}
              field={field}
              label={label(field)}
              editable={canEdit(field)}
              editor="number"
              align="end"
              editValue={editText(field, value)}
              display={value === null ? <EmptyValue /> : formatValue(field, value)}
            />
          );
        },
      });

    const textColumn = (field: Extract<UnitFieldKey, "title" | "orientation" | "parking" | "storage" | "external_id">) =>
      helper.accessor((row) => orUndefined(row[field]), {
        id: field,
        sortUndefined: "last",
        meta: { label: label(field) },
        cell: ({ row }) => {
          const value = row.original[field];
          return (
            <EditableCell
              unit={row.original}
              field={field}
              label={label(field)}
              editable={canEdit(field)}
              editor="text"
              editValue={value ?? ""}
              display={value === null ? <EmptyValue /> : <span className="line-clamp-1 max-w-64">{value}</span>}
            />
          );
        },
      });

    const typeOptions: CellOption[] = UNIT_TYPES.map((value) => ({ value, label: tTypes(value) }));
    const ownershipOptions: CellOption[] = OWNERSHIP_TYPES.map((value) => ({ value, label: tOwnership(value) }));
    const stageOptions: CellOption[] = stages.map((stage) => ({ value: stage.id, label: stage.name }));
    const buildingOptions: CellOption[] = buildings.map((building) => ({ value: building.id, label: building.name }));

    return helper.columns([
      helper.accessor("unit_number", {
        id: "unit_number",
        meta: { label: label("unit_number"), fixed: true },
        enableHiding: false,
        sortFn: (a, b) => compareUnitNumbers(a.original.unit_number, b.original.unit_number),
        cell: ({ row }) => <UnitNumberCell unit={row.original} />,
      }),
      textColumn("title"),
      helper.accessor("unit_type", {
        id: "unit_type",
        meta: { label: label("unit_type") },
        cell: ({ row }) => (
          <EditableCell
            unit={row.original}
            field="unit_type"
            label={label("unit_type")}
            editable={canEditContent}
            editor="select"
            nullable={false}
            options={typeOptions}
            editValue={row.original.unit_type}
            display={tTypes(row.original.unit_type)}
          />
        ),
      }),
      helper.accessor("status", {
        id: "status",
        meta: { label: label("status") },
        sortFn: (a, b) => statusOrder(a.original.status) - statusOrder(b.original.status),
        filterFn: (row, _columnId, value: UnitStatus[]) => value.length === 0 || value.includes(row.original.status),
        cell: ({ row }) => <StatusCell unit={row.original} />,
      }),
      helper.accessor((row) => (row.stage_id ? stageNames.get(row.stage_id) : undefined), {
        id: "stage",
        sortUndefined: "last",
        meta: { label: label("stage") },
        filterFn: (row, _columnId, value: string) =>
          value === "" || (value === "none" ? row.original.stage_id === null : row.original.stage_id === value),
        cell: ({ row }) => {
          const name = row.original.stage_id ? stageNames.get(row.original.stage_id) : undefined;
          return (
            <EditableCell
              unit={row.original}
              field="stage_id"
              label={label("stage")}
              editable={canEditContent && stages.length > 0}
              editor="select"
              options={stageOptions}
              editValue={row.original.stage_id ?? ""}
              display={name ?? <EmptyValue />}
            />
          );
        },
      }),
      helper.accessor((row) => (row.building_id ? buildingNames.get(row.building_id) : undefined), {
        id: "building",
        sortUndefined: "last",
        meta: { label: label("building") },
        filterFn: (row, _columnId, value: string) =>
          value === "" || (value === "none" ? row.original.building_id === null : row.original.building_id === value),
        cell: ({ row }) => {
          const name = row.original.building_id ? buildingNames.get(row.original.building_id) : undefined;
          return (
            <EditableCell
              unit={row.original}
              field="building_id"
              label={label("building")}
              editable={canEditContent && buildings.length > 0}
              editor="select"
              options={buildingOptions}
              editValue={row.original.building_id ?? ""}
              display={name ?? <EmptyValue />}
            />
          );
        },
      }),
      numberColumn("floor"),
      numberColumn("rooms"),
      numberColumn("bedrooms"),
      numberColumn("bathrooms"),
      numberColumn("bra_i"),
      numberColumn("bra_e"),
      numberColumn("bra_b"),
      numberColumn("tba"),
      numberColumn("plot_area"),
      numberColumn("price"),
      numberColumn("purchase_costs"),
      numberColumn("shared_debt"),
      numberColumn("monthly_fee"),
      helper.accessor(
        (row) => orUndefined(calculateTotals({ price: row.price, purchaseCosts: row.purchase_costs, sharedDebt: row.shared_debt }).total),
        {
          id: "total",
          sortUndefined: "last",
          meta: { label: label("total"), align: "end" },
          cell: ({ getValue }) => {
            const value = getValue();
            return (
              <div className="px-2 py-1.5 text-right font-medium tabular-nums">
                {value === undefined ? <EmptyValue /> : formatCurrency(value)}
              </div>
            );
          },
        },
      ),
      helper.accessor(
        (row) =>
          orUndefined(
            calculateTotals({ price: row.price, purchaseCosts: row.purchase_costs, sharedDebt: row.shared_debt }).totalWithSharedDebt,
          ),
        {
          id: "total_with_debt",
          sortUndefined: "last",
          meta: { label: label("total_with_debt"), align: "end" },
          cell: ({ getValue }) => {
            const value = getValue();
            return (
              <div className="px-2 py-1.5 text-right tabular-nums">
                {value === undefined ? <EmptyValue /> : formatCurrency(value)}
              </div>
            );
          },
        },
      ),
      helper.accessor((row) => orUndefined(row.ownership_type), {
        id: "ownership_type",
        sortUndefined: "last",
        meta: { label: label("ownership_type") },
        cell: ({ row }) => (
          <EditableCell
            unit={row.original}
            field="ownership_type"
            label={label("ownership_type")}
            editable={canEditContent}
            editor="select"
            options={ownershipOptions}
            editValue={row.original.ownership_type ?? ""}
            display={row.original.ownership_type ? tOwnership(row.original.ownership_type) : <EmptyValue />}
          />
        ),
      }),
      textColumn("orientation"),
      textColumn("parking"),
      textColumn("storage"),
      textColumn("external_id"),
      helper.accessor("is_hidden", {
        id: "is_hidden",
        meta: { label: label("is_hidden") },
        cell: ({ row }) => (
          <EditableCell
            unit={row.original}
            field="is_hidden"
            label={label("is_hidden")}
            editable={canEditContent}
            editor="select"
            nullable={false}
            options={[
              { value: "false", label: tCommon("no") },
              { value: "true", label: tCommon("yes") },
            ]}
            editValue={String(row.original.is_hidden)}
            display={row.original.is_hidden ? tCommon("yes") : tCommon("no")}
          />
        ),
      }),
      helper.accessor("updated_at", {
        id: "updated_at",
        meta: { label: label("updated_at") },
        cell: ({ row }) => (
          <div className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">{formatDateTime(row.original.updated_at)}</div>
        ),
      }),
      helper.display({
        id: "actions",
        enableHiding: false,
        meta: { label: t("table.actions"), fixed: true },
        cell: ({ row }) => <RowActions unit={row.original} />,
      }),
    ]);
  }, [t, tTypes, tOwnership, tCommon, stages, buildings, canEditContent, canSell]);
}

function UnitNumberCell({ unit }: { unit: UnitListItem }) {
  const t = useTranslations("units.table");
  const { orgSlug, projectSlug } = useUnitsTable();
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5">
      <Link
        href={`/${orgSlug}/projects/${projectSlug}/units/${unit.id}`}
        className="font-medium whitespace-nowrap underline-offset-4 hover:underline focus-visible:underline"
      >
        {unit.unit_number}
      </Link>
      {unit.is_hidden ? (
        <span title={t("hiddenUnit")} className="text-muted-foreground">
          <EyeOffIcon aria-hidden="true" className="size-3.5" />
          <span className="sr-only">{t("hiddenUnit")}</span>
        </span>
      ) : null}
    </div>
  );
}
