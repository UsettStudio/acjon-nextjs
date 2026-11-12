"use client";

import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AddressSearch } from "@/features/projects/components/address-search";
import { LocationMap } from "@/features/projects/components/location-map";
import type { LocationInput } from "@/features/projects/schemas";
import { parseNorwegianNumber } from "@/lib/format/parse";

export type LocationErrors = Partial<Record<keyof LocationInput, string | undefined>>;

const coordinateText = (value: number | null) => (value === null ? "" : String(value).replace(".", ","));

/** Koordinat som tekst mens den skrives, og som tall når feltet forlates. */
function CoordinateInput({
  name,
  label,
  value,
  onCommit,
  error,
}: {
  name: string;
  label: string;
  value: number | null;
  onCommit: (value: number | null) => void;
  error?: string;
}) {
  const [text, setText] = useState(coordinateText(value));
  const [previous, setPrevious] = useState(value);
  if (previous !== value) {
    setPrevious(value);
    setText(coordinateText(value));
  }
  return (
    <Field name={name} label={label} error={error}>
      {(field) => (
        <Input
          {...field}
          inputMode="decimal"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={() => {
            const parsed = parseNorwegianNumber(text);
            onCommit(parsed.ok ? parsed.value : value);
            if (!parsed.ok) {
              setText(coordinateText(value));
            }
          }}
        />
      )}
    </Field>
  );
}

/** Adresse, poststed, kommune og plassering i kart. Brukes i veiviseren og i prosjektinnstillingene. */
export function LocationFields({
  value,
  onChange,
  errors,
}: {
  value: LocationInput;
  onChange: (value: LocationInput) => void;
  errors: LocationErrors;
}) {
  const t = useTranslations("projects.location");
  const set = <K extends keyof LocationInput>(key: K, next: LocationInput[K]) => onChange({ ...value, [key]: next });
  const position = value.lat !== null && value.lng !== null ? { lat: value.lat, lng: value.lng } : null;

  return (
    <div className="grid gap-5">
      <AddressSearch
        onSelect={(suggestion) =>
          onChange({
            address: suggestion.address,
            postal_code: suggestion.postalCode ?? "",
            city: suggestion.city ?? "",
            municipality: suggestion.municipality ?? "",
            lat: suggestion.lat,
            lng: suggestion.lng,
          })
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="address" label={t("address")} error={errors.address} className="sm:col-span-2">
          {(field) => (
            <Input {...field} autoComplete="street-address" value={value.address} onChange={(event) => set("address", event.target.value)} />
          )}
        </Field>
        <Field name="postal-code" label={t("postalCode")} error={errors.postal_code}>
          {(field) => (
            <Input
              {...field}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={4}
              className="max-w-32"
              value={value.postal_code}
              onChange={(event) => set("postal_code", event.target.value)}
            />
          )}
        </Field>
        <Field name="city" label={t("city")} error={errors.city}>
          {(field) => <Input {...field} value={value.city} onChange={(event) => set("city", event.target.value)} />}
        </Field>
        <Field name="municipality" label={t("municipality")} error={errors.municipality}>
          {(field) => (
            <Input {...field} value={value.municipality} onChange={(event) => set("municipality", event.target.value)} />
          )}
        </Field>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium">{t("map")}</p>
        <p className="text-sm text-muted-foreground">{t("mapHelp")}</p>
        <LocationMap
          value={position}
          onChange={(next) => onChange({ ...value, lat: next.lat, lng: next.lng })}
          label={t("mapLabel")}
          unavailableText={t("mapUnavailable")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <CoordinateInput
          name="lat"
          label={t("lat")}
          value={value.lat}
          onCommit={(lat) => set("lat", lat)}
          error={errors.lat}
        />
        <CoordinateInput
          name="lng"
          label={t("lng")}
          value={value.lng}
          onCommit={(lng) => set("lng", lng)}
          error={errors.lng}
        />
        <Button
          type="button"
          variant="outline"
          disabled={!position}
          onClick={() => onChange({ ...value, lat: null, lng: null })}
        >
          <XIcon aria-hidden="true" />
          {t("clearPosition")}
        </Button>
      </div>
    </div>
  );
}
