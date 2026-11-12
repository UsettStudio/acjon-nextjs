"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MILESTONE_KEYS, type MilestoneInput, type MilestoneKey } from "@/features/projects/schemas";

export type ListErrors = (index: number, field: string) => string | undefined;

/** Fremdrift: milepæler med fritekst («Høsten 2027») og/eller dato. Tomme milepæler lagres ikke. */
export function MilestonesEditor({
  value,
  onChange,
  errorFor,
}: {
  value: MilestoneInput[];
  onChange: (value: MilestoneInput[]) => void;
  errorFor: ListErrors;
}) {
  const t = useTranslations("projects.milestones");
  const update = (index: number, patch: Partial<MilestoneInput>) =>
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  return (
    <div className="grid gap-4">
      {value.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : null}
      <ol className="grid gap-4">
        {value.map((milestone, index) => (
          <li key={index} className="grid gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-[12rem_1fr_1fr_10rem_auto] lg:items-end">
            <Field name={`milestone-${index}-key`} label={t("type")}>
              {(field) => (
                <Select value={milestone.key} onValueChange={(key) => update(index, { key: key as MilestoneKey })}>
                  <SelectTrigger {...field} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MILESTONE_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {t(`keys.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
            {milestone.key === "custom" ? (
              <Field name={`milestone-${index}-label`} label={t("label")} error={errorFor(index, "label")}>
                {(field) => (
                  <Input {...field} value={milestone.label} onChange={(event) => update(index, { label: event.target.value })} />
                )}
              </Field>
            ) : (
              <div className="hidden lg:block" />
            )}
            <Field name={`milestone-${index}-text`} label={t("text")} error={errorFor(index, "text")}>
              {(field) => (
                <Input
                  {...field}
                  placeholder={t("textPlaceholder")}
                  value={milestone.text}
                  onChange={(event) => update(index, { text: event.target.value })}
                />
              )}
            </Field>
            <Field name={`milestone-${index}-date`} label={t("date")} error={errorFor(index, "date")}>
              {(field) => (
                <Input {...field} type="date" value={milestone.date} onChange={(event) => update(index, { date: event.target.value })} />
              )}
            </Field>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("remove", { name: milestone.key === "custom" ? milestone.label || t("keys.custom") : t(`keys.${milestone.key}`) })}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <Trash2Icon aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ol>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={value.length >= 20}
          onClick={() => onChange([...value, { key: "custom", label: "", text: "", date: "" }])}
        >
          <PlusIcon aria-hidden="true" />
          {t("add")}
        </Button>
      </div>
    </div>
  );
}
