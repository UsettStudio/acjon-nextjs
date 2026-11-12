"use client";

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BUTTON_STYLES,
  contrastRatio,
  FONT_KEYS,
  resolveTheme,
  SITE_STYLES,
  type ResolvedTheme,
  type SiteStyle,
  type ThemeOverrides,
} from "@/features/site-builder/theme";

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
 * Designstil, farger, skrift og knappestil. parent er laget under: merkevareprofilen
 * for en prosjektside, ingenting for merkevaren. Et felt som ikke er satt, arver
 * fra laget under eller fra standardverdiene i designstilen som gjelder.
 */
export function ThemeFields({
  value,
  parent,
  onChange,
  disabled,
  inheritLabel,
}: {
  value: ThemeOverrides;
  parent: ThemeOverrides;
  onChange: (value: ThemeOverrides) => void;
  disabled: boolean;
  /** Teksten under en farge som arves fra parent, for eksempel «Fra merkevareprofilen». */
  inheritLabel: string;
}) {
  const t = useTranslations("siteBuilder.theme");
  const format = useFormatter();
  const id = useId();
  const effective = resolveTheme(parent, value);
  /** Verdien feltet får når det ikke er satt her. Stilen som gjelder, kan gi andre standardverdier. */
  const inherited = <K extends keyof ResolvedTheme>(key: K): ResolvedTheme[K] => {
    const without: ThemeOverrides = { ...value };
    delete without[key as keyof ThemeOverrides];
    return resolveTheme(parent, without)[key];
  };
  const base = {
    primary: inherited("primary"),
    accent: inherited("accent"),
    background: inherited("background"),
    foreground: inherited("foreground"),
    heading_font: inherited("heading_font"),
    body_font: inherited("body_font"),
    button_style: inherited("button_style"),
  };

  function set<K extends keyof ThemeOverrides>(key: K, next: ThemeOverrides[K] | undefined) {
    const copy: ThemeOverrides = { ...value };
    if (next === undefined) {
      delete copy[key];
    } else {
      copy[key] = next;
    }
    onChange(copy);
  }

  /** Hvor en arvet farge kommer fra: laget under (merkevareprofilen) eller standardfargene i stilen. */
  const inheritedFrom = (key: ColorKey) =>
    parent[key] !== undefined ? inheritLabel : t("fromStyle", { style: t(`styles.${effective.style}`) });

  const textContrast = contrastRatio(effective.foreground, effective.background);
  const primaryContrast = contrastRatio(effective.primary, effective.background);
  const ratio = (number: number) => format.number(number, { maximumFractionDigits: 1 });

  return (
    <div className="grid gap-6">
      <fieldset className="grid gap-3">
        <legend className="mb-2 font-medium">{t("styleTitle")}</legend>
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-style`}>{t("style")}</Label>
          <Select
            value={value.style ?? INHERIT}
            disabled={disabled}
            onValueChange={(next) => set("style", next === INHERIT ? undefined : (next as SiteStyle))}
          >
            <SelectTrigger id={`${id}-style`} className="w-full" aria-describedby={`${id}-style-help`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={INHERIT}>{t("inheritOption", { value: t(`styles.${inherited("style")}`) })}</SelectItem>
              {SITE_STYLES.map((style) => (
                <SelectItem key={style} value={style}>
                  {t(`styles.${style}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p id={`${id}-style-help`} className="text-sm text-muted-foreground">
            {t(`styleHelp.${effective.style}`)} {t("styleDefaults")}
          </p>
        </div>
      </fieldset>

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
              inheritLabel={inheritedFrom(key)}
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
        <p className={effective.style === "nordic" ? "text-[0.625rem] tracking-[0.22em] uppercase" : "text-xs font-semibold tracking-wide uppercase"} style={{ color: effective.primary }}>
          {t("sampleEyebrow")}
        </p>
        <p className={effective.style === "nordic" ? "text-xl font-light" : "text-lg font-semibold"} style={{ color: effective.style === "nordic" ? effective.foreground : effective.primary }}>
          {t("sampleHeading")}
        </p>
        <p className="text-sm">{t("sampleText")}</p>
        <span
          className={effective.style === "nordic" ? "justify-self-start px-5 py-2.5 text-[0.625rem] tracking-[0.2em] uppercase" : "justify-self-start px-4 py-2 text-sm font-semibold"}
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
