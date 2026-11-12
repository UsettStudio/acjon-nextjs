"use client";

import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_ORDER } from "@/features/selector/model";
import type { EditorUnit } from "@/features/selector/queries";
import { changeUnitStatus } from "@/features/units/actions";
import type { UnitStatus } from "@/features/units/fields";
import type { RealtimeState } from "@/features/units/use-units-realtime";
import { cn } from "@/lib/utils";


export type StatusMenuState = { unitIds: string[]; shapeCount: number; at: { x: number; y: number } };

/** Menyen som åpnes ved klikk på en markering i Status-modus. */
export function StatusMenu({
  organizationId,
  menu,
  unitsById,
  statusColors,
  onClose,
  onChanged,
}: {
  organizationId: string;
  menu: StatusMenuState | null;
  unitsById: ReadonlyMap<string, EditorUnit>;
  statusColors: Record<UnitStatus, string>;
  onClose: () => void;
  onChanged: (unitIds: string[], status: UnitStatus) => void;
}) {
  return (
    <Popover open={menu !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      <PopoverAnchor asChild>
        <span
          aria-hidden="true"
          className="pointer-events-none fixed size-px"
          style={{ left: menu?.at.x ?? 0, top: menu?.at.y ?? 0 }}
        />
      </PopoverAnchor>
      <PopoverContent className="w-80" side="bottom" align="start" collisionPadding={12}>
        {menu ? (
          <StatusMenuForm
            key={`${menu.unitIds.join(",")}:${menu.at.x}:${menu.at.y}`}
            organizationId={organizationId}
            menu={menu}
            unitsById={unitsById}
            statusColors={statusColors}
            onClose={onClose}
            onChanged={onChanged}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function StatusMenuForm({
  organizationId,
  menu,
  unitsById,
  statusColors,
  onClose,
  onChanged,
}: {
  organizationId: string;
  menu: StatusMenuState;
  unitsById: ReadonlyMap<string, EditorUnit>;
  statusColors: Record<UnitStatus, string>;
  onClose: () => void;
  onChanged: (unitIds: string[], status: UnitStatus) => void;
}) {
  const t = useTranslations("selector.status");
  const tStatus = useTranslations("unitStatus");
  const tErrors = useTranslations("errors");
  const id = useId();
  const units = menu.unitIds.map((unitId) => unitsById.get(unitId)).filter((unit): unit is EditorUnit => Boolean(unit));
  const current = new Set(units.map((unit) => unit.status));
  const [status, setStatus] = useState<UnitStatus | null>(current.size === 1 ? ([...current][0] ?? null) : null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  if (units.length === 0) {
    return (
      <div className="grid gap-3 text-sm">
        <p>{t("notLinked", { count: menu.shapeCount })}</p>
        <Button type="button" variant="outline" size="sm" className="justify-self-end" onClick={onClose}>
          {t("close")}
        </Button>
      </div>
    );
  }

  function save() {
    if (!status) {
      return;
    }
    startTransition(async () => {
      const result = await changeUnitStatus({
        organizationId,
        unitIds: units.map((unit) => unit.id),
        status,
        note,
        source: "selector",
      });
      if (!result.ok) {
        toast.error(tErrors(result.error));
        return;
      }
      onChanged(
        units.map((unit) => unit.id),
        status,
      );
      toast.success(
        units.length === 1
          ? t("changedOne", { unit: units[0]?.unitNumber ?? "", status: tStatus(status) })
          : t("changedMany", { count: units.length, status: tStatus(status) }),
      );
      onClose();
    });
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div>
        <p id={`${id}-title`} className="font-semibold">
          {units.length === 1 ? units[0]?.unitNumber : t("manyUnits", { count: units.length })}
        </p>
        {units.length === 1 && units[0] ? (
          <p className="text-xs text-muted-foreground">{t("currentStatus", { status: tStatus(units[0].status) })}</p>
        ) : null}
      </div>
      <div role="radiogroup" aria-labelledby={`${id}-title`} className="grid grid-cols-2 gap-2">
        {STATUS_ORDER.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={status === option}
            onClick={() => setStatus(option)}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
              status === option && "border-foreground bg-accent",
            )}
            data-status={option}
          >
            <span className="size-3 rounded-full" style={{ backgroundColor: statusColors[option] }} aria-hidden="true" />
            {tStatus(option)}
          </button>
        ))}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-note`}>{t("note")}</Label>
        <Textarea id={`${id}-note`} value={note} maxLength={1000} rows={2} onChange={(event) => setNote(event.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={!status || pending}>
          {pending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}

export function StatusPanel({
  units,
  statusColors,
  selectionCount,
  linkedSelectionCount,
  realtime,
  canSell,
  onOpenMenu,
}: {
  units: EditorUnit[];
  statusColors: Record<UnitStatus, string>;
  selectionCount: number;
  linkedSelectionCount: number;
  realtime: RealtimeState;
  canSell: boolean;
  onOpenMenu: (at: { x: number; y: number }) => void;
}) {
  const t = useTranslations("selector.status");
  const tStatus = useTranslations("unitStatus");
  const visible = units.filter((unit) => !unit.isHidden);
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, visible.filter((unit) => unit.status === status).length]));

  return (
    <div className="grid content-start gap-4">
      <p className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
        <span
          className={cn(
            "size-2 rounded-full",
            realtime === "live" ? "bg-emerald-500" : realtime === "connecting" ? "bg-amber-400" : "bg-slate-400",
          )}
          aria-hidden="true"
        />
        {t(`realtime.${realtime}`)}
      </p>
      <section aria-labelledby="status-legend-title" className="grid gap-2">
        <h3 id="status-legend-title" className="text-sm font-semibold">
          {t("legend")}
        </h3>
        <ul className="grid gap-1.5">
          {STATUS_ORDER.map((status) => (
            <li key={status} className="flex items-center gap-2 text-sm">
              <span
                className="size-4 rounded-sm border-2"
                style={{ backgroundColor: `${statusColors[status]}73`, borderColor: statusColors[status] }}
                aria-hidden="true"
              />
              <span>{tStatus(status)}</span>
              <span className="ml-auto text-muted-foreground tabular-nums">{counts[status]}</span>
            </li>
          ))}
        </ul>
      </section>
      {canSell ? (
        <>
          <p className="text-sm text-muted-foreground">{t("hint")}</p>
          {selectionCount > 0 ? (
            <div className="grid gap-2 rounded-md border bg-background p-3">
              <p className="text-sm">{t("selected", { count: selectionCount, linked: linkedSelectionCount })}</p>
              <Button
                type="button"
                size="sm"
                disabled={linkedSelectionCount === 0}
                onClick={(event) => {
                  const box = event.currentTarget.getBoundingClientRect();
                  onOpenMenu({ x: box.left, y: box.bottom });
                }}
              >
                {t("changeSelected")}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t("readOnly")}</p>
      )}
      <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">{t("noPublishNeeded")}</p>
    </div>
  );
}
