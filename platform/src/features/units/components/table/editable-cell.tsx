"use client";

import { LoaderCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUnitsTable } from "@/features/units/components/table/context";
import type { UnitListItem } from "@/features/units/queries";
import type { EditableField } from "@/features/units/schemas";
import { cn } from "@/lib/utils";

const NONE = "__none__";

export type CellOption = { value: string; label: string };

/** Tomt felt: strek for øyet, «ikke satt» for skjermlesere. */
export function EmptyValue() {
  const t = useTranslations("units.table");
  return (
    <span className="text-muted-foreground">
      <span aria-hidden="true">–</span>
      <span className="sr-only">{t("empty")}</span>
    </span>
  );
}

/**
 * Celle som kan redigeres. Klikk, Enter eller F2 åpner redigering. Enter eller å
 * forlate feltet lagrer, Escape avbryter. Uten tilgang vises bare verdien.
 */
export function EditableCell({
  unit,
  field,
  label,
  display,
  editValue,
  editor,
  options,
  nullable = true,
  editable,
  align = "start",
}: {
  unit: UnitListItem;
  field: EditableField;
  label: string;
  display: React.ReactNode;
  /** Verdien i redigeringsfeltet, som tekst. */
  editValue: string;
  editor: "text" | "number" | "select";
  options?: CellOption[];
  nullable?: boolean;
  editable: boolean;
  align?: "start" | "end";
}) {
  const t = useTranslations("units.table");
  const { saveField } = useUnitsTable();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(editValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  useEffect(() => {
    if (editing && editor !== "select") {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    if (!editing && returnFocus.current) {
      returnFocus.current = false;
      buttonRef.current?.focus();
    }
  }, [editing, editor]);

  if (!editable) {
    return <div className={cn("px-2 py-1.5", align === "end" && "text-right tabular-nums")}>{display}</div>;
  }

  async function commit(value: string, focusBack: boolean) {
    returnFocus.current = focusBack;
    if (value.trim() === editValue.trim()) {
      setEditing(false);
      setError(null);
      return;
    }
    setSaving(true);
    const message = await saveField(unit, field, value === NONE ? null : value);
    setSaving(false);
    if (message) {
      setError(message);
      returnFocus.current = false;
      if (editor !== "select") {
        inputRef.current?.focus();
      }
      return;
    }
    setError(null);
    setEditing(false);
  }

  function start() {
    setDraft(editValue);
    setError(null);
    setEditing(true);
  }

  if (editing && editor === "select") {
    return (
      <Select
        defaultOpen
        value={draft === "" ? NONE : draft}
        onValueChange={(value) => {
          setDraft(value);
          void commit(value === NONE ? "" : value, true);
        }}
        onOpenChange={(open) => {
          if (!open && !saving) {
            returnFocus.current = true;
            setEditing(false);
          }
        }}
      >
        <SelectTrigger size="sm" aria-label={t("editField", { field: label, unit: unit.unit_number })} className="w-full min-w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {nullable ? <SelectItem value={NONE}>{t("none")}</SelectItem> : null}
          {options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (editing) {
    return (
      <div className="relative">
        <Input
          ref={inputRef}
          value={draft}
          inputMode={editor === "number" ? "decimal" : undefined}
          aria-label={t("editField", { field: label, unit: unit.unit_number })}
          aria-invalid={error !== null}
          disabled={saving}
          className={cn("h-8 min-w-24", align === "end" && "text-right tabular-nums", saving && "pr-8")}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void commit(draft, false)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void commit(draft, true);
            } else if (event.key === "Escape") {
              event.preventDefault();
              returnFocus.current = true;
              setError(null);
              setEditing(false);
            }
          }}
        />
        {saving ? (
          <LoaderCircleIcon aria-hidden="true" className="absolute top-1/2 right-2 size-4 -translate-y-1/2 animate-spin" />
        ) : null}
        {error ? (
          <p role="alert" className="absolute top-full left-0 z-10 mt-1 w-max max-w-64 rounded-md border bg-popover px-2 py-1 text-xs text-destructive shadow-md">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={start}
      onKeyDown={(event) => {
        if (event.key === "F2") {
          event.preventDefault();
          start();
        }
      }}
      className={cn(
        "flex min-h-8 w-full items-center rounded-sm px-2 py-1.5 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
        align === "end" && "justify-end text-right tabular-nums",
      )}
    >
      {display}
      <span className="sr-only">{t("editHint")}</span>
    </button>
  );
}
