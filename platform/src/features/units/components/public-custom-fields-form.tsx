"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updatePublicCustomFields } from "@/features/units/actions";

/** Velg hvilke egne felt som vises på enhetssiden. Felt som ikke er valgt, sendes aldri til publiserte sider. */
export function PublicCustomFieldsForm({
  organizationId,
  projectId,
  names,
  initialPublic,
  disabled,
}: {
  organizationId: string;
  projectId: string;
  names: string[];
  initialPublic: string[];
  disabled: boolean;
}) {
  const t = useTranslations("projects.settings.customFields");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [selected, setSelected] = useState(() => new Set(initialPublic));
  const [pending, startTransition] = useTransition();
  // Felt som er offentlige, men ikke lenger brukes på noen enhet, vises også, så de kan slås av.
  const all = [...new Set([...names, ...initialPublic])].sort((a, b) => a.localeCompare(b, "nb"));

  if (all.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await updatePublicCustomFields(organizationId, projectId, [...selected]);
          if (result.ok) {
            toast.success(tCommon("saved"));
          } else {
            toast.error(tErrors(result.error as "unknown"));
          }
        });
      }}
    >
      <fieldset className="grid gap-2" disabled={disabled}>
        <legend className="mb-1 text-sm font-medium">{t("legend")}</legend>
        {all.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <Checkbox
              id={`public-field-${name}`}
              checked={selected.has(name)}
              onCheckedChange={(checked) =>
                setSelected((previous) => {
                  const next = new Set(previous);
                  if (checked === true) {
                    next.add(name);
                  } else {
                    next.delete(name);
                  }
                  return next;
                })
              }
            />
            <Label htmlFor={`public-field-${name}`} className="font-normal">
              {name}
            </Label>
          </div>
        ))}
      </fieldset>
      {!disabled ? (
        <Button type="submit" className="justify-self-start" disabled={pending}>
          {pending ? tCommon("saving") : tCommon("save")}
        </Button>
      ) : null}
    </form>
  );
}
