"use client";

import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateOrganizationStatusColors, updateProjectDisplaySettings } from "@/features/selector/actions";
import { FILL_OPACITY, STATUS_ORDER, type StatusColorOverrides } from "@/features/selector/model";
import type { UnitStatus } from "@/features/units/fields";

const HEX = /^#[0-9a-fA-F]{6}$/;

function ColorRow({
  status,
  value,
  inherited,
  disabled,
  onChange,
}: {
  status: UnitStatus;
  value: string | undefined;
  inherited: string;
  disabled: boolean;
  onChange: (value: string | undefined) => void;
}) {
  const t = useTranslations("selector.colors");
  const tStatus = useTranslations("unitStatus");
  const id = useId();
  const [text, setText] = useState(value ?? "");
  const effective = value && HEX.test(value) ? value : inherited;
  const invalid = text !== "" && !HEX.test(text);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className="size-6 shrink-0 rounded border-2"
        style={{ backgroundColor: `${effective}${Math.round(FILL_OPACITY * 255).toString(16)}`, borderColor: effective }}
        aria-hidden="true"
      />
      <label htmlFor={`${id}-text`} className="w-24 text-sm font-medium">
        {tStatus(status)}
      </label>
      <input
        type="color"
        aria-label={t("picker", { status: tStatus(status) })}
        value={effective.toLowerCase()}
        disabled={disabled}
        onChange={(event) => {
          setText(event.target.value.toUpperCase());
          onChange(event.target.value.toUpperCase());
        }}
        className="h-9 w-12 cursor-pointer rounded border bg-background p-1 disabled:cursor-not-allowed"
      />
      <Input
        id={`${id}-text`}
        value={text}
        placeholder={inherited}
        disabled={disabled}
        maxLength={7}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(event) => {
          const next = event.target.value.trim();
          setText(next);
          if (next === "") {
            onChange(undefined);
          } else if (HEX.test(next)) {
            onChange(next.toUpperCase());
          }
        }}
        className="h-9 w-28 font-mono"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => {
            setText("");
            onChange(undefined);
          }}
        >
          {t("reset")}
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">{t("inherited")}</span>
      )}
      {invalid ? (
        <span id={`${id}-error`} className="text-xs text-destructive">
          {t("invalid")}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Statusfarger for organisasjonen eller ett prosjekt. Et tomt felt arver:
 * prosjektet arver organisasjonens farger, organisasjonen arver standardfargene.
 */
export function StatusColorsForm({
  scope,
  organizationId,
  projectId,
  initial,
  inherited,
  showPriceOnSold,
  disabled,
}: {
  scope: "organization" | "project";
  organizationId: string;
  projectId?: string;
  initial: StatusColorOverrides;
  inherited: Record<UnitStatus, string>;
  showPriceOnSold?: boolean;
  disabled: boolean;
}) {
  const t = useTranslations("selector.colors");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [colors, setColors] = useState<StatusColorOverrides>(initial);
  const [showPrice, setShowPrice] = useState(showPriceOnSold ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const priceId = useId();

  return (
    <form
      className="grid max-w-2xl gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result =
            scope === "project" && projectId
              ? await updateProjectDisplaySettings(organizationId, projectId, { statusColors: colors, showPriceOnSold: showPrice })
              : await updateOrganizationStatusColors(organizationId, colors);
          if (result.ok) {
            toast.success(tCommon("saved"));
          } else {
            setError(tErrors(result.error));
          }
        });
      }}
    >
      <FormAlert message={error} />
      <fieldset disabled={disabled} className="grid gap-3">
        <legend className="sr-only">{t("legend")}</legend>
        {STATUS_ORDER.map((status) => (
          <ColorRow
            key={status}
            status={status}
            value={colors[status]}
            inherited={inherited[status]}
            disabled={disabled}
            onChange={(value) =>
              setColors((current) => {
                const next = { ...current };
                if (value) {
                  next[status] = value;
                } else {
                  delete next[status];
                }
                return next;
              })
            }
          />
        ))}
      </fieldset>
      {scope === "project" ? (
        <div className="grid gap-1">
          <label htmlFor={priceId} className="flex items-center gap-2 text-sm font-medium">
            <input
              id={priceId}
              type="checkbox"
              className="size-4"
              checked={showPrice}
              disabled={disabled}
              onChange={(event) => setShowPrice(event.target.checked)}
            />
            {t("showPriceOnSold")}
          </label>
          <p className="pl-6 text-sm text-muted-foreground">{t("showPriceOnSoldHelp")}</p>
        </div>
      ) : null}
      <SubmitButton pending={pending} disabled={disabled} className="justify-self-start">
        {tCommon("save")}
      </SubmitButton>
    </form>
  );
}
