"use client";

import { useTranslations } from "next-intl";

import { Field } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROJECT_PHASES, type ProjectPhase } from "@/features/projects/schemas";

export function PhaseSelect({
  name,
  value,
  onChange,
  error,
  label,
}: {
  name: string;
  value: ProjectPhase;
  onChange: (value: ProjectPhase) => void;
  error?: string;
  label?: string;
}) {
  const t = useTranslations("projects");
  return (
    <Field name={name} label={label ?? t("phase")} description={t(`phaseHelp.${value}`)} error={error}>
      {(field) => (
        <Select value={value} onValueChange={(next) => onChange(next as ProjectPhase)}>
          <SelectTrigger {...field} className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_PHASES.map((phase) => (
              <SelectItem key={phase} value={phase}>
                {t(`phases.${phase}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  );
}
