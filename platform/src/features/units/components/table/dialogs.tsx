"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useState, useTransition } from "react";

import { SubmitButton } from "@/components/forms/submit-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Building, Stage, StatusEvent } from "@/features/projects/queries";
import { getUnitStatusHistory } from "@/features/units/actions";
import { UnitStatusBadge } from "@/features/units/components/unit-status-badge";
import { UNIT_STATUSES, type UnitStatus } from "@/features/units/fields";
import { adjustPrice, PRICE_ROUNDING, type PriceRounding } from "@/features/units/price";
import type { UnitListItem } from "@/features/units/queries";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { parseNorwegianNumber } from "@/lib/format/parse";

const unitList = (units: UnitListItem[], max = 6) =>
  units.length <= max
    ? units.map((unit) => unit.unit_number).join(", ")
    : `${units
        .slice(0, max)
        .map((unit) => unit.unit_number)
        .join(", ")} …`;

/** Endre status for én eller flere enheter, med notat som lagres i statusloggen. */
export function StatusDialog({
  units,
  onClose,
  onSubmit,
}: {
  units: UnitListItem[] | null;
  onClose: () => void;
  onSubmit: (units: UnitListItem[], status: UnitStatus, note: string) => Promise<boolean>;
}) {
  const t = useTranslations("units.status");
  const tCommon = useTranslations("common");
  const id = useId();
  const [status, setStatus] = useState<UnitStatus | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [previous, setPrevious] = useState(units);
  if (previous !== units) {
    setPrevious(units);
    setStatus(units?.[0]?.status ?? null);
    setNote("");
  }

  return (
    <Dialog open={units !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent closeLabel={tCommon("close")}>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!units || !status) {
              return;
            }
            startTransition(async () => {
              if (await onSubmit(units, status, note)) {
                onClose();
              }
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("dialogTitle", { count: units?.length ?? 0 })}</DialogTitle>
            <DialogDescription>{units ? unitList(units) : null}</DialogDescription>
          </DialogHeader>
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">{t("newStatus")}</legend>
            <div className="flex flex-wrap gap-2">
              {UNIT_STATUSES.map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/30"
                >
                  <input
                    type="radio"
                    name={`${id}-status`}
                    value={value}
                    checked={status === value}
                    onChange={() => setStatus(value)}
                    className="accent-primary"
                  />
                  <UnitStatusBadge status={value} />
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-2">
            <Label htmlFor={`${id}-note`}>{t("note")}</Label>
            <Textarea
              id={`${id}-note`}
              rows={3}
              maxLength={1000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              aria-describedby={`${id}-note-help`}
            />
            <p id={`${id}-note-help`} className="text-sm text-muted-foreground">
              {t("noteHelp")}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon("cancel")}
            </Button>
            <SubmitButton pending={pending} disabled={!status}>
              {t("save")}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Statusloggen for én enhet: hvem, når, fra og til, kilde og notat. */
export function StatusHistoryDialog({
  organizationId,
  unit,
  onClose,
}: {
  organizationId: string;
  unit: UnitListItem | null;
  onClose: () => void;
}) {
  const t = useTranslations("units.history");
  const tSources = useTranslations("units.sources");
  const tCommon = useTranslations("common");
  const [events, setEvents] = useState<{ unitId: string; items: StatusEvent[] | null; failed: boolean } | null>(null);

  useEffect(() => {
    if (!unit) {
      return;
    }
    let cancelled = false;
    void getUnitStatusHistory(organizationId, unit.id).then((result) => {
      if (!cancelled) {
        setEvents({ unitId: unit.id, items: result.ok ? result.data : null, failed: !result.ok });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [organizationId, unit]);

  const current = unit && events?.unitId === unit.id ? events : null;

  return (
    <Dialog open={unit !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent closeLabel={tCommon("close")} className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title", { unit: unit?.unit_number ?? "" })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {current === null ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {tCommon("loading")}
          </p>
        ) : current.failed || current.items === null ? (
          <p className="text-sm text-destructive">{t("failed")}</p>
        ) : current.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ol className="grid max-h-96 gap-3 overflow-y-auto">
            {current.items.map((event) => (
              <li key={event.id} className="grid gap-1 rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {event.fromStatus ? <UnitStatusBadge status={event.fromStatus} /> : null}
                  <span aria-hidden="true">→</span>
                  <span className="sr-only">{t("to")}</span>
                  <UnitStatusBadge status={event.toStatus} />
                </div>
                <p className="text-muted-foreground">
                  {t("meta", {
                    name: event.changedBy ?? t("system"),
                    time: formatDateTime(event.createdAt),
                    source: tSources(event.source as "admin"),
                  })}
                </p>
                {event.note ? <p>«{event.note}»</p> : null}
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type PriceChange = { mode: "set"; value: string } | { mode: "percent"; percent: string; roundTo: PriceRounding };

/** Masseendring av pris: ny fast pris eller endring i prosent med avrunding. */
export function PriceDialog({
  units,
  onClose,
  onSubmit,
}: {
  units: UnitListItem[] | null;
  onClose: () => void;
  onSubmit: (units: UnitListItem[], change: PriceChange) => Promise<boolean>;
}) {
  const t = useTranslations("units.bulk");
  const tCommon = useTranslations("common");
  const id = useId();
  const [mode, setMode] = useState<"percent" | "set">("percent");
  const [value, setValue] = useState("");
  const [roundTo, setRoundTo] = useState<PriceRounding>(1000);
  const [pending, startTransition] = useTransition();
  const [previous, setPrevious] = useState(units);
  if (previous !== units) {
    setPrevious(units);
    setValue("");
  }

  const parsed = parseNorwegianNumber(value);
  const number = parsed.ok ? parsed.value : null;
  const priced = (units ?? []).filter((unit) => unit.price !== null);
  const preview =
    mode === "percent" && number !== null && number !== 0 && priced.length > 0
      ? priced.slice(0, 3).map((unit) => ({
          unit: unit.unit_number,
          before: unit.price ?? 0,
          after: adjustPrice(unit.price ?? 0, number, roundTo),
        }))
      : [];
  const valid = number !== null && (mode === "set" ? number >= 0 : number !== 0 && number >= -90 && number <= 1000);

  return (
    <Dialog open={units !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent closeLabel={tCommon("close")}>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!units || !valid) {
              return;
            }
            startTransition(async () => {
              const change: PriceChange = mode === "set" ? { mode, value } : { mode, percent: value, roundTo };
              if (await onSubmit(units, change)) {
                onClose();
              }
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("priceTitle", { count: units?.length ?? 0 })}</DialogTitle>
            <DialogDescription>{units ? unitList(units) : null}</DialogDescription>
          </DialogHeader>
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">{t("priceMode")}</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name={`${id}-mode`} checked={mode === "percent"} onChange={() => setMode("percent")} className="accent-primary" />
              {t("pricePercent")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name={`${id}-mode`} checked={mode === "set"} onChange={() => setMode("set")} className="accent-primary" />
              {t("priceSet")}
            </label>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`${id}-value`}>{mode === "percent" ? t("percentLabel") : t("priceLabel")}</Label>
              <Input
                id={`${id}-value`}
                inputMode="decimal"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={mode === "percent" ? "3" : "4 250 000"}
                aria-invalid={value !== "" && !valid}
              />
            </div>
            {mode === "percent" ? (
              <div className="grid gap-2">
                <Label htmlFor={`${id}-round`}>{t("roundTo")}</Label>
                <Select value={String(roundTo)} onValueChange={(next) => setRoundTo(Number(next) as PriceRounding)}>
                  <SelectTrigger id={`${id}-round`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_ROUNDING.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {formatCurrency(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          {mode === "percent" ? (
            <p className="text-sm text-muted-foreground">
              {t("percentHelp", { priced: priced.length, total: units?.length ?? 0 })}
            </p>
          ) : null}
          {preview.length > 0 ? (
            <ul className="grid gap-1 rounded-md bg-muted p-3 text-sm tabular-nums" aria-label={t("preview")}>
              {preview.map((item) => (
                <li key={item.unit}>
                  {item.unit}: {formatCurrency(item.before)} → <strong>{formatCurrency(item.after)}</strong>
                </li>
              ))}
            </ul>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon("cancel")}
            </Button>
            <SubmitButton pending={pending} disabled={!valid}>
              {t("apply")}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const NONE = "none";

export type AssignChange = { stage_id: string | null } | { building_id: string | null } | { is_hidden: boolean };

/** Masseendring av byggetrinn, bygg eller synlighet. */
export function AssignDialog({
  target,
  stages,
  buildings,
  onClose,
  onSubmit,
}: {
  target: { units: UnitListItem[]; field: "stage_id" | "building_id" | "is_hidden" } | null;
  stages: Stage[];
  buildings: Building[];
  onClose: () => void;
  onSubmit: (units: UnitListItem[], change: AssignChange) => Promise<boolean>;
}) {
  const t = useTranslations("units.bulk");
  const tCommon = useTranslations("common");
  const id = useId();
  const [value, setValue] = useState(NONE);
  const [pending, startTransition] = useTransition();
  const [previous, setPrevious] = useState(target);
  if (previous !== target) {
    setPrevious(target);
    setValue(target?.field === "is_hidden" ? "false" : NONE);
  }

  const options =
    target?.field === "stage_id"
      ? stages.map((stage) => ({ value: stage.id, label: stage.name }))
      : target?.field === "building_id"
        ? buildings.map((building) => ({ value: building.id, label: building.name }))
        : [
            { value: "false", label: t("visible") },
            { value: "true", label: t("hidden") },
          ];

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent closeLabel={tCommon("close")}>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!target) {
              return;
            }
            const change: AssignChange =
              target.field === "is_hidden"
                ? { is_hidden: value === "true" }
                : target.field === "stage_id"
                  ? { stage_id: value === NONE ? null : value }
                  : { building_id: value === NONE ? null : value };
            startTransition(async () => {
              if (await onSubmit(target.units, change)) {
                onClose();
              }
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {target ? t(`assignTitle.${target.field}`, { count: target.units.length }) : null}
            </DialogTitle>
            <DialogDescription>{target ? unitList(target.units) : null}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={`${id}-value`}>{target ? t(`assignLabel.${target.field}`) : null}</Label>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger id={`${id}-value`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {target?.field !== "is_hidden" ? <SelectItem value={NONE}>{t("none")}</SelectItem> : null}
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon("cancel")}
            </Button>
            <SubmitButton pending={pending}>{t("apply")}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteUnitsDialog({
  units,
  onClose,
  onConfirm,
}: {
  units: UnitListItem[] | null;
  onClose: () => void;
  onConfirm: (units: UnitListItem[]) => Promise<boolean>;
}) {
  const t = useTranslations("units.delete");
  const tCommon = useTranslations("common");
  const [pending, startTransition] = useTransition();
  return (
    <AlertDialog open={units !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title", { count: units?.length ?? 0 })}</AlertDialogTitle>
          <AlertDialogDescription>
            {units ? unitList(units) : null}. {t("body")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              if (!units) {
                return;
              }
              startTransition(async () => {
                if (await onConfirm(units)) {
                  onClose();
                }
              });
            }}
          >
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
