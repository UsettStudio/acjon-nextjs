"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import { useValidationMessage } from "@/components/forms/use-action-errors";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MAX_CUSTOM_FIELDS } from "@/features/units/custom-fields";
import type { UnitFormInput } from "@/features/units/schemas";

/** Egne felt på enheten: navn og verdi. Hvilke som vises offentlig, velges i prosjektinnstillingene. */
export function CustomFieldsEditor({
  control,
  register,
  errors,
  disabled,
  suggestions,
}: {
  control: Control<UnitFormInput, unknown, unknown>;
  register: UseFormRegister<UnitFormInput>;
  errors: FieldErrors<UnitFormInput>;
  disabled: boolean;
  /** Feltnavn som brukes på andre enheter i prosjektet. */
  suggestions: string[];
}) {
  const t = useTranslations("units.form.custom");
  const validation = useValidationMessage();
  const { fields, append, remove } = useFieldArray({ control, name: "custom_fields" });
  const listId = "custom-field-names";
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">{t("help")}</p>
      {fields.length === 0 ? <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">{t("empty")}</p> : null}
      <ul className="grid gap-3">
        {fields.map((item, index) => {
          const itemErrors = errors.custom_fields?.[index];
          return (
            <li key={item.id} className="grid items-start gap-3 rounded-md border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
              <Field name={`custom-${index}-key`} label={t("key")} error={validation(itemErrors?.key?.message)}>
                {(field) => <Input {...field} list={listId} maxLength={60} disabled={disabled} {...register(`custom_fields.${index}.key`)} />}
              </Field>
              <Field name={`custom-${index}-value`} label={t("value")} error={validation(itemErrors?.value?.message)}>
                {(field) => <Input {...field} maxLength={500} disabled={disabled} {...register(`custom_fields.${index}.value`)} />}
              </Field>
              {!disabled ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="sm:mt-6"
                  aria-label={t("remove", { name: item.key || t("unnamed") })}
                  onClick={() => remove(index)}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
      <datalist id={listId}>
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      {!disabled ? (
        <Button
          type="button"
          variant="outline"
          className="justify-self-start"
          disabled={fields.length >= MAX_CUSTOM_FIELDS}
          onClick={() => append({ key: "", value: "" })}
        >
          <PlusIcon aria-hidden="true" />
          {t("add")}
        </Button>
      ) : null}
    </div>
  );
}
