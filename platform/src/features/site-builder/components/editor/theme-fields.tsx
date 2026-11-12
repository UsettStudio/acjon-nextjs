"use client";

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUTTON_STYLES, contrastRatio, FONT_KEYS, type ResolvedTheme, type ThemeOverrides } from "@/features/site-builder/theme";

const COLOR_KEYS = ["primary", "accent", "background", "foreground"] as const;
type ColorKey = (typeof COLOR_KEYS)[number];

const HEX = /^#[0-9a-fA-F]{6}$/;
const INHERIT = "__inherit";

function ColorField({
  colorKey,
  value,
  inherited,
  disabled,
  inheritLabel,
  onChange,
}: {
  colorKey: ColorKey;
  value: string | undefined;
  inherited: string;
  disabled: boolean;
  inheritLabel: string;
  onChange: (value: string | undefined) => void;
}) {
  const t = useTranslations("siteBuilder.theme");
  const id = useId();
  const effective = value ?? inherited;
  const [text, setText] = useState(effective);
  const [previous, setPrevious] = useState(effective);
  if (previous !== effective) {
    setPrevious(effective);
    setText(effective);
  }
  const label = t(`colors.${colorKey}`);
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={`${id}-hex`}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={t("colorPicker", { name: label })}
          value={effective.toLowerCase()}
          disabled={disabled}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-background p-1 disabled:cursor-not-allowed"
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        <Input
          id={`${id}-hex`}
          value={text}
          maxLength={7}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!HEX.test(text)}
          aria-describedby={`${id}-state`}
          className="w-28 font-mono uppercase"
          onChange={(event) => {
            const next = event.target.value.startsWith("#") ? event.target.value : `#${event.target.value}`;
            setText(next);
            if (HEX.test(next)) {
              onChange(next.toUpperCase());
            }
          }}
        />
        {value !== undefined && !disabled ? (
          <Button type="button" variant="ghost" size="icon" aria-label={t("reset", { name: label })} onClick={() => onChange(undefined)}>
            <RotateCcwIcon aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      <p id={`${id}-state`} className="text-xs text-muted-foreground">
        {value === undefined ? inheritLabel : t("overridden")}
      </p>
    </div>
  );
}

/**
 * Farger, skrift og knappestil. base er verdiene som gjelder når et felt ikke
 * er satt: merkevareprofilen for en prosjektside, standardtemaet for merkevaren.
 */
export function ThemeFields({
  value,
  base,
  onChange,
  disabled,
  inheritLabel,
}: {
  value: ThemeOverrides;
  base: ResolvedTheme;
  onChange: (value: ThemeOverrides) => void;
  disabled: boolean;
  /** For eksempel «Fra merkevareprofilen». */
  inheritLabel: string;
}) {
  const t = useTranslations("siteBuilder.theme");
  const format = useFormatter();
  const id = useId();
  const effective: ResolvedTheme = { ...base, ...Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) };

  function set<K extends keyof ThemeOverrides>(key: K, next: ThemeOverrides[K] | undefined) {
    const copy: ThemeOverrides = { ...value };
    if (next === undefined) {
      delete copy[key];
    } else {
      copy[key] = next;
    }
    onChange(copy);
  }

  const textContrast = contrastRatio(effective.foreground, effective.background);
  const primaryContrast = contrastRatio(effective.primary, effective.background);
  const ratio = (number: number) => format.number(number, { maximumFractionDigits: 1 });

  return (
    <div className="grid gap-6">
      <fieldset className="grid gap-4">
        <legend className="mb-2 font-medium">{t("colorsTitle")}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {COLOR_KEYS.map((key) => (
            <ColorField
              key={key}
              colorKey={key}
              value={value[key]}
              inherited={base[key]}
              disabled={disabled}
              inheritLabel={inheritLabel}
              onChange={(next) => set(key, next)}
            />
          ))}
        </div>
        {textContrast < 4.5 ? (
          <p role="status" className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t("lowTextContrast", { ratio: ratio(textContrast) })}
          </p>
        ) : null}
        {primaryContrast < 3 ? (
          <p role="status" className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t("lowPrimaryContrast", { ratio: ratio(primaryContrast) })}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-2 font-medium">{t("typographyTitle")}</legend>
        {(["heading_font", "body_font"] as const).map((key) => (
          <div key={key} className="grid gap-1.5">
            <Label htmlFor={`${id}-${key}`}>{t(key === "heading_font" ? "headingFont" : "bodyFont")}</Label>
            <Select
              value={value[key] ?? INHERIT}
              disabled={disabled}
              onValueChange={(next) => set(key, next === INHERIT ? undefined : (next as (typeof FONT_KEYS)[number]))}
            >
              <SelectTrigger id={`${id}-${key}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={INHERIT}>{t("inheritOption", { value: t(`fonts.${base[key]}`) })}</SelectItem>
                {FONT_KEYS.map((font) => (
                  <SelectItem key={font} value={font}>
                    {t(`fonts.${font}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-button`}>{t("buttonStyle")}</Label>
          <Select
            value={value.button_style ?? INHERIT}
            disabled={disabled}
            onValueChange={(next) => set("button_style", next === INHERIT ? undefined : (next as (typeof BUTTON_STYLES)[number]))}
          >
            <SelectTrigger id={`${id}-button`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={INHERIT}>{t("inheritOption", { value: t(`buttonStyles.${base.button_style}`) })}</SelectItem>
              {BUTTON_STYLES.map((style) => (
                <SelectItem key={style} value={style}>
                  {t(`buttonStyles.${style}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </fieldset>

      <div aria-hidden="true" className="grid gap-2 rounded-md border p-4" style={{ background: effective.background, color: effective.foreground }}>
        <p className="text-xs tracking-wide uppercase opacity-70">{t("sample")}</p>
        <p className="text-lg font-semibold" style={{ color: effective.primary }}>
          {t("sampleHeading")}
        </p>
        <p className="text-sm">{t("sampleText")}</p>
        <span
          className="justify-self-start px-4 py-2 text-sm font-semibold"
          style={{
            background: effective.primary,
            color: contrastRatio("#FFFFFF", effective.primary) >= contrastRatio("#111111", effective.primary) ? "#FFFFFF" : "#111111",
            borderRadius: effective.button_style === "pill" ? 9999 : effective.button_style === "square" ? 0 : 8,
          }}
        >
          {t("sampleButton")}
        </span>
      </div>
    </div>
  );
}
