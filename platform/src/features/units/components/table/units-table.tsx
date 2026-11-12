"use client";

import { functionalUpdate, useTable, type ColumnFiltersState, type ColumnVisibilityState } from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  Columns3Icon,
  DownloadIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Building, Stage } from "@/features/projects/queries";
import {
  adjustUnitPrices,
  changeUnitStatus,
  deleteUnits,
  updateUnitFields,
  updateUnitsBulk,
} from "@/features/units/actions";
import { DEFAULT_HIDDEN_COLUMNS, unitTableFeatures, useUnitColumns } from "@/features/units/components/table/columns";
import { UnitsTableContext, type UnitsTableActions } from "@/features/units/components/table/context";
import {
  AssignDialog,
  DeleteUnitsDialog,
  PriceDialog,
  StatusDialog,
  StatusHistoryDialog,
  type AssignChange,
  type PriceChange,
} from "@/features/units/components/table/dialogs";
import { useUnitsRealtime, type RealtimeState } from "@/features/units/use-units-realtime";
import { STATUS_STYLES } from "@/features/units/components/unit-status-badge";
import { UNIT_STATUSES, type UnitStatus } from "@/features/units/fields";
import type { UnitListItem } from "@/features/units/queries";
import type { EditableField } from "@/features/units/schemas";
import type { CommonActionError, ValidationKey } from "@/lib/actions/result";
import { useLocalStorageState } from "@/lib/hooks/use-local-storage-state";
import { cn } from "@/lib/utils";

type Props = {
  organizationId: string;
  orgSlug: string;
  projectId: string;
  projectSlug: string;
  projectName: string;
  units: UnitListItem[];
  stages: Stage[];
  buildings: Building[];
  canEditContent: boolean;
  canSell: boolean;
  /** Importknappen, som har sin egen dialog. */
  importButton?: React.ReactNode;
};

function upsertUnit(rows: UnitListItem[], unit: UnitListItem): UnitListItem[] {
  const index = rows.findIndex((row) => row.id === unit.id);
  if (index === -1) {
    return [...rows, unit];
  }
  const next = rows.slice();
  next[index] = { ...rows[index], ...unit };
  return next;
}

function mergeUnits(rows: UnitListItem[], units: UnitListItem[]): UnitListItem[] {
  return units.reduce(upsertUnit, rows);
}

export function UnitsTable(props: Props) {
  const { organizationId, units, canEditContent, canSell } = props;
  const t = useTranslations("units");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const router = useRouter();

  // Lokale rader: endringer, sanntid og ny data fra serveren (etter import) flettes inn her.
  const [rows, setRows] = useState(units);
  const [serverUnits, setServerUnits] = useState(units);
  if (serverUnits !== units) {
    setServerUnits(units);
    setRows(units);
  }

  const [statusDialog, setStatusDialog] = useState<UnitListItem[] | null>(null);
  const [historyUnit, setHistoryUnit] = useState<UnitListItem | null>(null);
  const [priceUnits, setPriceUnits] = useState<UnitListItem[] | null>(null);
  const [assignTarget, setAssignTarget] = useState<{
    units: UnitListItem[];
    field: "stage_id" | "building_id" | "is_hidden";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UnitListItem[] | null>(null);

  const realtime = useUnitsRealtime(props.projectId, {
    onUpsert: (unit) => setRows((previous) => upsertUnit(previous, unit)),
    onDelete: (unitId) => setRows((previous) => previous.filter((row) => row.id !== unitId)),
  });

  const errorMessage = useCallback(
    (result: { error: string; fieldErrors?: Record<string, ValidationKey> }, field?: string) => {
      const fieldError = field ? result.fieldErrors?.[field] : undefined;
      if (fieldError) {
        return tValidation(fieldError);
      }
      if (result.error === "unitNumberTaken" || result.error === "slugTaken" || result.error === "partial") {
        return t(`errors.${result.error}`);
      }
      return tErrors(result.error as CommonActionError);
    },
    [t, tErrors, tValidation],
  );

  const actions = useMemo<UnitsTableActions>(
    () => ({
      organizationId,
      orgSlug: props.orgSlug,
      projectSlug: props.projectSlug,
      canEditContent,
      canSell,
      stages: props.stages,
      buildings: props.buildings,
      saveField: async (unit: UnitListItem, field: EditableField, raw: unknown) => {
        const result = await updateUnitFields(organizationId, unit.id, { [field]: raw });
        if (result.ok) {
          setRows((previous) => upsertUnit(previous, result.data));
          return null;
        }
        return errorMessage(result, field);
      },
      changeStatus: async (selected: UnitListItem[], status: UnitStatus, note: string) => {
        const before = new Map(selected.map((unit) => [unit.id, unit.status]));
        setRows((previous) => previous.map((row) => (before.has(row.id) ? { ...row, status } : row)));
        const result = await changeUnitStatus({
          organizationId,
          unitIds: selected.map((unit) => unit.id),
          status,
          note,
          source: "table",
        });
        if (!result.ok) {
          setRows((previous) => previous.map((row) => ({ ...row, status: before.get(row.id) ?? row.status })));
          toast.error(errorMessage(result));
          return false;
        }
        toast.success(
          t("status.changed", {
            count: selected.length,
            unit: selected[0]?.unit_number ?? "",
            status: t(`status.values.${status}`),
          }),
        );
        return true;
      },
      openStatusDialog: setStatusDialog,
      openHistory: setHistoryUnit,
      requestDelete: setDeleteTarget,
    }),
    [
      organizationId,
      props.orgSlug,
      props.projectSlug,
      props.stages,
      props.buildings,
      canEditContent,
      canSell,
      errorMessage,
      t,
    ],
  );

  async function applyPrice(selected: UnitListItem[], change: PriceChange) {
    const ids = selected.map((unit) => unit.id);
    const result =
      change.mode === "set"
        ? await updateUnitsBulk(organizationId, ids, { price: change.value })
        : await adjustUnitPrices({ organizationId, unitIds: ids, percent: change.percent, roundTo: change.roundTo });
    if (!result.ok) {
      toast.error(errorMessage(result, "price"));
      return false;
    }
    setRows((previous) => mergeUnits(previous, result.data));
    toast.success(t("bulk.priceChanged", { count: result.data.length }));
    return true;
  }

  async function applyAssign(selected: UnitListItem[], change: AssignChange) {
    const result = await updateUnitsBulk(
      organizationId,
      selected.map((unit) => unit.id),
      change,
    );
    if (!result.ok) {
      toast.error(errorMessage(result));
      return false;
    }
    setRows((previous) => mergeUnits(previous, result.data));
    toast.success(t("bulk.updated", { count: result.data.length }));
    return true;
  }

  async function applyDelete(selected: UnitListItem[]) {
    const result = await deleteUnits(
      organizationId,
      selected.map((unit) => unit.id),
    );
    if (!result.ok) {
      toast.error(errorMessage(result));
      return false;
    }
    const removed = new Set(selected.map((unit) => unit.id));
    setRows((previous) => previous.filter((row) => !removed.has(row.id)));
    toast.success(t("delete.done", { count: result.data.deleted }));
    router.refresh();
    return true;
  }

  return (
    <UnitsTableContext.Provider value={actions}>
      <UnitsGrid
        {...props}
        rows={rows}
        realtime={realtime}
        onBulkStatus={setStatusDialog}
        onBulkPrice={setPriceUnits}
        onBulkAssign={(selected, field) => setAssignTarget({ units: selected, field })}
        onBulkDelete={setDeleteTarget}
      />
      <StatusDialog units={statusDialog} onClose={() => setStatusDialog(null)} onSubmit={actions.changeStatus} />
      <StatusHistoryDialog organizationId={organizationId} unit={historyUnit} onClose={() => setHistoryUnit(null)} />
      <PriceDialog units={priceUnits} onClose={() => setPriceUnits(null)} onSubmit={applyPrice} />
      <AssignDialog
        target={assignTarget}
        stages={props.stages}
        buildings={props.buildings}
        onClose={() => setAssignTarget(null)}
        onSubmit={applyAssign}
      />
      <DeleteUnitsDialog units={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={applyDelete} />
    </UnitsTableContext.Provider>
  );
}

const parseVisibility = (value: unknown): ColumnVisibilityState | null =>
  typeof value === "object" && value !== null && Object.values(value).every((item) => typeof item === "boolean")
    ? (value as ColumnVisibilityState)
    : null;

function UnitsGrid({
  orgSlug,
  projectId,
  projectSlug,
  projectName,
  rows,
  realtime,
  stages,
  buildings,
  canEditContent,
  canSell,
  importButton,
  onBulkStatus,
  onBulkPrice,
  onBulkAssign,
  onBulkDelete,
}: Props & {
  rows: UnitListItem[];
  realtime: RealtimeState;
  onBulkStatus: (units: UnitListItem[]) => void;
  onBulkPrice: (units: UnitListItem[]) => void;
  onBulkAssign: (units: UnitListItem[], field: "stage_id" | "building_id" | "is_hidden") => void;
  onBulkDelete: (units: UnitListItem[]) => void;
}) {
  const t = useTranslations("units");
  const columns = useUnitColumns();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UnitStatus[]>([]);
  const [stageFilter, setStageFilter] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [selection, setSelection] = useState<Record<string, true>>({});
  const anchor = useRef<string | null>(null);

  const defaultVisibility = useMemo<ColumnVisibilityState>(
    () => ({
      ...Object.fromEntries(DEFAULT_HIDDEN_COLUMNS.map((id) => [id, false])),
      stage: stages.length > 0,
      building: buildings.length > 0,
    }),
    [stages.length, buildings.length],
  );
  const [columnVisibility, setColumnVisibility] = useLocalStorageState(
    `units-columns:${projectId}`,
    defaultVisibility,
    parseVisibility,
  );

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [
      ...(statusFilter.length > 0 ? [{ id: "status", value: statusFilter }] : []),
      ...(stageFilter ? [{ id: "stage", value: stageFilter }] : []),
      ...(buildingFilter ? [{ id: "building", value: buildingFilter }] : []),
    ],
    [statusFilter, stageFilter, buildingFilter],
  );

  const table = useTable({
    features: unitTableFeatures,
    columns,
    data: rows,
    getRowId: (row) => row.id,
    state: { columnVisibility, columnFilters, globalFilter: search },
    onColumnVisibilityChange: (updater) => setColumnVisibility((previous) => functionalUpdate(updater, previous)),
    globalFilterFn: (row, columnId, value: string) =>
      String(row.getValue(columnId) ?? "")
        .toLocaleLowerCase("nb")
        .includes(value.trim().toLocaleLowerCase("nb")),
    getColumnCanGlobalFilter: (column) => column.id === "unit_number" || column.id === "title",
  });

  const visibleRows = table.getRowModel().rows;
  const selectedRows = visibleRows.filter((row) => selection[row.id]).map((row) => row.original);
  const allSelected = visibleRows.length > 0 && selectedRows.length === visibleRows.length;
  const someSelected = selectedRows.length > 0 && !allSelected;
  const filtered = search.trim() !== "" || columnFilters.length > 0;
  const counts = useMemo(() => {
    const result: Record<UnitStatus, number> = { upcoming: 0, available: 0, reserved: 0, sold: 0 };
    for (const row of rows) {
      result[row.status] += 1;
    }
    return result;
  }, [rows]);

  function toggleRow(id: string, shiftKey: boolean) {
    const ids = visibleRows.map((row) => row.id);
    setSelection((previous) => {
      const next = { ...previous };
      const select = !previous[id];
      const from = anchor.current ? ids.indexOf(anchor.current) : -1;
      const to = ids.indexOf(id);
      if (shiftKey && from >= 0 && to >= 0) {
        for (const rangeId of ids.slice(Math.min(from, to), Math.max(from, to) + 1)) {
          if (select) {
            next[rangeId] = true;
          } else {
            delete next[rangeId];
          }
        }
      } else if (select) {
        next[id] = true;
      } else {
        delete next[id];
      }
      return next;
    });
    anchor.current = id;
  }

  function toggleAll() {
    setSelection((previous) => {
      const next = { ...previous };
      for (const row of visibleRows) {
        if (allSelected) {
          delete next[row.id];
        } else {
          next[row.id] = true;
        }
      }
      return next;
    });
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter([]);
    setStageFilter("");
    setBuildingFilter("");
  }

  const base = `/${orgSlug}/projects/${projectSlug}`;
  const hideableColumns = table.getAllLeafColumns().filter((column) => column.getCanHide());

  const empty = rows.length === 0;

  // Verktøylinjen ligger på samme sted også når tabellen er tom. Da beholder
  // importdialogen sin tilstand når de første enhetene kommer inn.
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-2">
          {empty ? null : (
            <>
              <div className="relative">
                <SearchIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  aria-label={t("table.search")}
                  placeholder={t("table.search")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-56 pl-9"
                />
              </div>
              {stages.length > 0 ? (
                <Select
                  value={stageFilter || "all"}
                  onValueChange={(value) => setStageFilter(value === "all" ? "" : value)}
                >
                  <SelectTrigger aria-label={t("table.filterStage")} className="w-44">
                    <SelectValue>
                      {stageFilter === ""
                        ? t("table.allStages")
                        : stageFilter === "none"
                          ? t("table.noStage")
                          : stages.find((stage) => stage.id === stageFilter)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("table.allStages")}</SelectItem>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="none">{t("table.noStage")}</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}
              {buildings.length > 0 ? (
                <Select
                  value={buildingFilter || "all"}
                  onValueChange={(value) => setBuildingFilter(value === "all" ? "" : value)}
                >
                  <SelectTrigger aria-label={t("table.filterBuilding")} className="w-44">
                    <SelectValue>
                      {buildingFilter === ""
                        ? t("table.allBuildings")
                        : buildingFilter === "none"
                          ? t("table.noBuilding")
                          : buildings.find((building) => building.id === buildingFilter)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("table.allBuildings")}</SelectItem>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="none">{t("table.noBuilding")}</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}
              {filtered ? (
                <Button variant="ghost" onClick={resetFilters}>
                  <XIcon aria-hidden="true" />
                  {t("table.resetFilters")}
                </Button>
              ) : null}
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {empty ? null : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Columns3Icon aria-hidden="true" />
                  {t("table.columns")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
                <DropdownMenuLabel>{t("table.showColumns")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hideableColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) => column.toggleVisibility(checked === true)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {column.columnDef.meta?.label ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {canEditContent ? importButton : null}
          {empty ? null : (
            <Button asChild variant="outline">
              <a href={`${base}/units/export`} download>
                <DownloadIcon aria-hidden="true" />
                {t("table.export")}
              </a>
            </Button>
          )}
          {canEditContent ? (
            <Button asChild>
              <Link href={`${base}/units/new`}>
                <PlusIcon aria-hidden="true" />
                {t("table.newUnit")}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {empty ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
          <h2 className="text-lg font-semibold">{t("table.emptyTitle")}</h2>
          <p className="max-w-md text-muted-foreground">
            {canEditContent ? t("table.emptyBody") : t("table.emptyBodyNoAccess")}
          </p>
        </div>
      ) : (
        <>
          <div role="group" aria-label={t("table.filterStatus")} className="flex flex-wrap gap-2">
            {UNIT_STATUSES.map((status) => {
              const active = statusFilter.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setStatusFilter((previous) =>
                      previous.includes(status) ? previous.filter((item) => item !== status) : [...previous, status],
                    )
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    active && "border-foreground bg-accent font-medium",
                  )}
                >
                  <span aria-hidden="true" className={cn("size-2 rounded-full", STATUS_STYLES[status].dot)} />
                  {t(`status.values.${status}`)}
                  <span className="text-muted-foreground tabular-nums">{counts[status]}</span>
                </button>
              );
            })}
          </div>

          {selectedRows.length > 0 && canSell ? (
            <div
              role="region"
              aria-label={t("bulk.label")}
              className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/60 px-3 py-2"
            >
              <span className="mr-2 text-sm font-medium">{t("bulk.selected", { count: selectedRows.length })}</span>
              <Button size="sm" variant="outline" onClick={() => onBulkStatus(selectedRows)}>
                {t("bulk.status")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onBulkPrice(selectedRows)}>
                {t("bulk.price")}
              </Button>
              {canEditContent && stages.length > 0 ? (
                <Button size="sm" variant="outline" onClick={() => onBulkAssign(selectedRows, "stage_id")}>
                  {t("bulk.stage")}
                </Button>
              ) : null}
              {canEditContent && buildings.length > 0 ? (
                <Button size="sm" variant="outline" onClick={() => onBulkAssign(selectedRows, "building_id")}>
                  {t("bulk.building")}
                </Button>
              ) : null}
              {canEditContent ? (
                <Button size="sm" variant="outline" onClick={() => onBulkAssign(selectedRows, "is_hidden")}>
                  {t("bulk.visibility")}
                </Button>
              ) : null}
              {canEditContent ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => onBulkDelete(selectedRows)}
                >
                  {t("bulk.delete")}
                </Button>
              ) : null}
              <Button size="sm" variant="ghost" onClick={() => setSelection({})}>
                {t("bulk.clear")}
              </Button>
            </div>
          ) : null}

          <div className="relative max-h-[calc(100svh-14rem)] min-h-64 overflow-auto rounded-md border">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <caption className="sr-only">{t("table.caption", { project: projectName })}</caption>
              <thead>
                {table.getHeaderGroups().map((group) => (
                  <tr key={group.id}>
                    {canSell ? (
                      <th scope="col" className="sticky top-0 left-0 z-20 w-10 border-b bg-background px-3">
                        <Checkbox
                          aria-label={t("table.selectAll")}
                          checked={allSelected ? true : someSelected ? "indeterminate" : false}
                          onCheckedChange={toggleAll}
                        />
                      </th>
                    ) : null}
                    {group.headers.map((header) => {
                      const meta = header.column.columnDef.meta;
                      const sorted = header.column.getIsSorted();
                      const canSort = header.column.getCanSort() && header.column.id !== "actions";
                      return (
                        <th
                          key={header.id}
                          scope="col"
                          aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                          className={cn(
                            "sticky top-0 z-10 border-b bg-background px-1 py-1 font-medium whitespace-nowrap text-muted-foreground",
                            meta?.align === "end" ? "text-right" : "text-left",
                            header.column.id === "unit_number" && canSell && "left-10 z-20",
                            header.column.id === "unit_number" && !canSell && "left-0 z-20",
                          )}
                        >
                          {header.column.id === "actions" ? (
                            <span className="sr-only">{meta?.label}</span>
                          ) : canSort ? (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-sm px-2 py-1 outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
                                meta?.align === "end" && "flex-row-reverse",
                                sorted && "text-foreground",
                              )}
                            >
                              {meta?.label}
                              {sorted === "asc" ? (
                                <ArrowUpIcon aria-hidden="true" className="size-3.5" />
                              ) : sorted === "desc" ? (
                                <ArrowDownIcon aria-hidden="true" className="size-3.5" />
                              ) : (
                                <ArrowUpDownIcon aria-hidden="true" className="size-3.5 opacity-40" />
                              )}
                            </button>
                          ) : (
                            <span className="px-2">{meta?.label}</span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const selected = Boolean(selection[row.id]);
                  return (
                    <tr key={row.id} data-state={selected ? "selected" : undefined} className="group">
                      {canSell ? (
                        <td className="sticky left-0 z-[5] w-10 border-b bg-background px-3 group-hover:bg-muted group-data-[state=selected]:bg-muted">
                          <Checkbox
                            aria-label={t("table.selectUnit", { unit: row.original.unit_number })}
                            checked={selected}
                            onClick={(event) => {
                              event.preventDefault();
                              toggleRow(row.id, event.shiftKey);
                            }}
                          />
                        </td>
                      ) : null}
                      {row.getVisibleCells().map((cell) =>
                        cell.column.id === "unit_number" ? (
                          <th
                            key={cell.id}
                            scope="row"
                            className={cn(
                              "sticky z-[5] border-b bg-background px-1 text-left font-normal group-hover:bg-muted group-data-[state=selected]:bg-muted",
                              canSell ? "left-10" : "left-0",
                            )}
                          >
                            <table.FlexRender cell={cell} />
                          </th>
                        ) : (
                          <td
                            key={cell.id}
                            className="border-b px-1 group-hover:bg-muted/60 group-data-[state=selected]:bg-muted"
                          >
                            <table.FlexRender cell={cell} />
                          </td>
                        ),
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visibleRows.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <p className="text-muted-foreground">{t("table.noMatches")}</p>
                <Button variant="outline" onClick={resetFilters}>
                  {t("table.resetFilters")}
                </Button>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <p aria-live="polite">{t("table.showing", { shown: visibleRows.length, total: rows.length })}</p>
            <p className="flex items-center gap-1.5" data-realtime={realtime}>
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 rounded-full",
                  realtime === "live"
                    ? "bg-emerald-500"
                    : realtime === "offline"
                      ? "bg-amber-500"
                      : "bg-muted-foreground/40",
                )}
              />
              {t(`table.realtime.${realtime}`)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
