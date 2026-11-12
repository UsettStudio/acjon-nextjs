"use client";

import { ArrowDownIcon, ArrowUpIcon, ImageIcon, PlusIcon, Trash2Icon, TriangleAlertIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { createContext, use, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MediaAsset } from "@/features/media/assets";
import { AssetListField } from "@/features/media/components/asset-list-field";
import { AssetPicker } from "@/features/media/components/asset-picker";
import { AssetThumb } from "@/features/media/components/upload-zone";
import type { SiteLink } from "@/features/site-builder/blocks";
import { listItemTitle, type FieldSpec } from "@/features/site-builder/components/editor/field-specs";
import type { SiteEditorData } from "@/features/site-builder/queries";

type Values = Record<string, unknown>;

/** Det skjemaene trenger fra editoren: filer, sider, blokker og boligvelgere. */
export type FieldContext = {
  organizationId: string;
  projectId: string | null;
  assets: Record<string, MediaAsset>;
  addAssets: (assets: MediaAsset[]) => void;
  pages: { id: string; title: string }[];
  /** Blokker en lenke kan peke til (på siden som redigeres, eller forsiden for menyen). */
  blockOptions: { id: string; label: string }[];
  selectors: SiteEditorData["selectors"];
  disabled: boolean;
};

const FieldContextValue = createContext<FieldContext | null>(null);

export const FieldContextProvider = FieldContextValue.Provider;

function useFieldContext(): FieldContext {
  const context = use(FieldContextValue);
  if (!context) {
    throw new Error("FieldContextProvider mangler");
  }
  return context;
}

/** Første feil på stien eller under den, for felt som består av flere deler. */
function errorAt(errors: Record<string, string>, path: string): string | undefined {
  if (errors[path]) {
    return errors[path];
  }
  const nested = Object.keys(errors).find((key) => key.startsWith(`${path}.`));
  return nested ? errors[nested] : undefined;
}

const NONE = "__none";

/** Feltene i et skjema. Felt med en betingelse som ikke er oppfylt, vises ikke. */
export function FieldList({
  specs,
  values,
  onChange,
  errors,
  path = "",
}: {
  specs: FieldSpec[];
  values: Values;
  onChange: (values: Values) => void;
  errors: Record<string, string>;
  path?: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      {specs
        .filter((spec) => !spec.when || spec.when(values))
        .map((spec) => (
          <FieldControl
            key={spec.key}
            spec={spec}
            values={values}
            onChange={onChange}
            errors={errors}
            path={path ? `${path}.${spec.key}` : spec.key}
          />
        ))}
    </div>
  );
}

function FieldControl({
  spec,
  values,
  onChange,
  errors,
  path,
}: {
  spec: FieldSpec;
  values: Values;
  onChange: (values: Values) => void;
  errors: Record<string, string>;
  path: string;
}) {
  const t = useTranslations("siteBuilder.editor");
  const tValidation = useTranslations("validation");
  const context = useFieldContext();
  const value = values[spec.key];
  const set = (next: unknown) => onChange({ ...values, [spec.key]: next });
  const label = t(`fields.${spec.label ?? spec.key}` as "fields.heading");
  const help = spec.help ? t(`help.${spec.help}` as "help.richText") : undefined;
  const errorKey = spec.kind === "list" ? errors[path] : errorAt(errors, path);
  const error = errorKey ? tValidation(errorKey as "required") : undefined;

  switch (spec.kind) {
    case "text":
      return (
        <Field name={path} label={label} description={help} error={error}>
          {(field) => (
            <Input
              {...field}
              type={spec.inputType ?? "text"}
              maxLength={spec.max}
              value={typeof value === "string" ? value : ""}
              placeholder={spec.placeholder ? t(`placeholders.${spec.placeholder}` as "placeholders.videoUrl") : undefined}
              disabled={context.disabled}
              onChange={(event) => set(event.target.value)}
            />
          )}
        </Field>
      );
    case "textarea":
    case "richtext":
      return (
        <Field
          name={path}
          label={label}
          description={spec.kind === "richtext" ? (help ?? t("help.richText")) : help}
          error={error}
        >
          {(field) => (
            <Textarea
              {...field}
              rows={spec.kind === "richtext" ? 8 : (spec.rows ?? 3)}
              maxLength={spec.max}
              value={typeof value === "string" ? value : ""}
              disabled={context.disabled}
              onChange={(event) => set(event.target.value)}
            />
          )}
        </Field>
      );
    case "select":
      return (
        <Field name={path} label={label} description={help} error={error}>
          {(field) => (
            <Select
              value={String(value ?? spec.values[0])}
              disabled={context.disabled}
              onValueChange={(next) => set(spec.values.find((option) => String(option) === next) ?? spec.values[0])}
            >
              <SelectTrigger {...field} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {spec.values.map((option) => (
                  <SelectItem key={String(option)} value={String(option)}>
                    {t(`options.${spec.options}.${option}` as "options.align.left")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
      );
    case "range": {
      const number = typeof value === "number" ? value : spec.min;
      const shown = spec.unit === "percent" ? `${number} %` : spec.unit === "px" ? `${number} px` : String(number);
      return (
        <Field name={path} label={label} description={help} error={error}>
          {(field) => (
            <div className="flex items-center gap-3">
              <input
                {...field}
                type="range"
                min={spec.min}
                max={spec.max}
                step={spec.step}
                value={number}
                disabled={context.disabled}
                aria-valuetext={shown}
                className="h-2 flex-1 accent-primary"
                onChange={(event) => set(Number(event.target.value))}
              />
              <output className="w-16 text-right text-sm tabular-nums">{shown}</output>
            </div>
          )}
        </Field>
      );
    }
    case "number":
      return <NumberField path={path} label={label} help={help} error={error} value={typeof value === "number" ? value : null} onChange={set} min={spec.min} max={spec.max} />;
    case "boolean":
      return <BooleanField path={path} label={label} help={help} checked={value === true} onChange={set} />;
    case "image":
      return <ImageField label={label} help={help} error={error} value={typeof value === "string" ? value : null} onChange={set} />;
    case "assets": {
      const ids = Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
      return (
        <div className="grid gap-1">
          <AssetListField
            label={label}
            description={help}
            organizationId={context.organizationId}
            projectId={context.projectId}
            kind={spec.assetKind}
            value={ids.flatMap((id) => (context.assets[id] ? [context.assets[id]] : []))}
            onChange={(assets) => {
              context.addAssets(assets);
              set(assets.map((asset) => asset.id));
            }}
            max={spec.max}
            disabled={context.disabled}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      );
    }
    case "link":
      return <LinkField label={label} help={help} error={error} value={(value as SiteLink | null) ?? null} onChange={set} required={spec.required} />;
    case "selector":
      return (
        <Field name={path} label={label} description={help} error={error}>
          {(field) => (
            <Select
              value={typeof value === "string" ? value : NONE}
              disabled={context.disabled}
              // Ny boligvelger: startvisningen hører til den gamle og nullstilles.
              onValueChange={(next) => onChange({ ...values, [spec.key]: next === NONE ? null : next, entry_view_id: null })}
            >
              <SelectTrigger {...field} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("selectorNone")}</SelectItem>
                {context.selectors.map((selector) => (
                  <SelectItem key={selector.id} value={selector.id}>
                    {selector.publishedAt ? selector.name : t("selectorUnpublished", { name: selector.name })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
      );
    case "selectorView": {
      const selector = context.selectors.find((item) => item.id === values[spec.selectorKey]);
      return (
        <Field name={path} label={label} description={help} error={error}>
          {(field) => (
            <Select
              value={typeof value === "string" ? value : NONE}
              disabled={context.disabled}
              onValueChange={(next) => set(next === NONE ? null : next)}
            >
              <SelectTrigger {...field} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("entryViewDefault")}</SelectItem>
                {(selector?.views ?? []).map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
      );
    }
    case "date":
    case "time":
      return (
        <Field name={path} label={label} description={help} error={error}>
          {(field) => (
            <Input
              {...field}
              type={spec.kind}
              required={!spec.optional}
              value={typeof value === "string" ? value : ""}
              disabled={context.disabled}
              className="w-auto"
              onChange={(event) => set(event.target.value)}
            />
          )}
        </Field>
      );
    case "list":
      return (
        <ListField
          spec={spec}
          label={label}
          help={help}
          error={error}
          value={Array.isArray(value) ? (value as Values[]) : []}
          onChange={set}
          errors={errors}
          path={path}
        />
      );
  }
}

function BooleanField({
  path,
  label,
  help,
  checked,
  onChange,
}: {
  path: string;
  label: string;
  help: string | undefined;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const context = useFieldContext();
  const id = `${path}-${useId()}`;
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        disabled={context.disabled}
        aria-describedby={help ? `${id}-help` : undefined}
        onCheckedChange={(next) => onChange(next === true)}
        className="mt-0.5"
      />
      <div className="grid gap-1">
        <Label htmlFor={id} className="font-normal">
          {label}
        </Label>
        {help ? (
          <p id={`${id}-help`} className="text-sm text-muted-foreground">
            {help}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Tall som skrives fritt. Komma godtas som desimaltegn. */
function NumberField({
  path,
  label,
  help,
  error,
  value,
  onChange,
  min,
  max,
}: {
  path: string;
  label: string;
  help: string | undefined;
  error: string | undefined;
  value: number | null;
  onChange: (value: number | null) => void;
  min: number;
  max: number;
}) {
  const tValidation = useTranslations("validation");
  const context = useFieldContext();
  const [text, setText] = useState(value === null ? "" : String(value));
  const [previous, setPrevious] = useState(value);
  const [invalid, setInvalid] = useState(false);
  if (previous !== value) {
    // Endret utenfra (for eksempel gjenoppretting). Vis den nye verdien.
    setPrevious(value);
    if (Number(text.replace(",", ".")) !== value) {
      setText(value === null ? "" : String(value));
      setInvalid(false);
    }
  }
  return (
    <Field name={path} label={label} description={help} error={invalid ? tValidation("numberInvalid") : error}>
      {(field) => (
        <Input
          {...field}
          inputMode="decimal"
          autoComplete="off"
          value={text}
          disabled={context.disabled}
          className="w-40"
          onChange={(event) => {
            setText(event.target.value);
            const raw = event.target.value.trim().replace(",", ".");
            if (raw === "") {
              setInvalid(false);
              onChange(null);
              return;
            }
            const number = Number(raw);
            const ok = Number.isFinite(number) && number >= min && number <= max;
            setInvalid(!ok);
            if (ok) {
              onChange(number);
            }
          }}
        />
      )}
    </Field>
  );
}

/** Ett bilde fra mediebiblioteket. */
function ImageField({
  label,
  help,
  error,
  value,
  onChange,
}: {
  label: string;
  help: string | undefined;
  error: string | undefined;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const t = useTranslations("siteBuilder.editor.image");
  const context = useFieldContext();
  const id = useId();
  const [open, setOpen] = useState(false);
  const asset = value ? context.assets[value] : undefined;
  return (
    <div className="grid gap-2" role="group" aria-labelledby={`${id}-label`} aria-describedby={help ? `${id}-help` : undefined}>
      <span id={`${id}-label`} className="text-sm leading-none font-medium">
        {label}
      </span>
      {value ? (
        <div className="flex items-center gap-3 rounded-md border p-2">
          <span className="block size-14 shrink-0 overflow-hidden rounded border bg-muted">{asset ? <AssetThumb asset={asset} /> : null}</span>
          <span className="min-w-0 flex-1 text-sm">
            <span className="block truncate">{asset?.filename ?? t("unknown")}</span>
            {asset && !asset.altText ? <span className="text-xs text-amber-700 dark:text-amber-400">{t("missingAlt")}</span> : null}
          </span>
          {!context.disabled ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
                {t("change")}
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label={t("remove", { field: label })} onClick={() => onChange(null)}>
                <XIcon aria-hidden="true" />
              </Button>
            </>
          ) : null}
        </div>
      ) : (
        <Button type="button" variant="outline" className="justify-self-start" disabled={context.disabled} onClick={() => setOpen(true)}>
          <ImageIcon aria-hidden="true" />
          {t("choose")}
        </Button>
      )}
      {help ? (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {help}
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <AssetPicker
        open={open}
        onOpenChange={setOpen}
        organizationId={context.organizationId}
        projectId={context.projectId}
        kind="image"
        title={t("pickerTitle", { field: label })}
        alreadySelected={[]}
        max={1}
        onPick={(assets) => {
          const [picked] = assets;
          if (picked) {
            context.addAssets([picked]);
            onChange(picked.id);
          }
        }}
      />
    </div>
  );
}

type LinkType = "none" | SiteLink["type"];

/** Lenke til en side, en blokk eller en adresse. required: «Ingen lenke» er ikke et valg. */
export function LinkField({
  label,
  help,
  error,
  value,
  onChange,
  required = false,
}: {
  label: string;
  help?: string;
  error: string | undefined;
  value: SiteLink | null;
  onChange: (value: SiteLink | null) => void;
  required?: boolean;
}) {
  const t = useTranslations("siteBuilder.editor.link");
  const context = useFieldContext();
  const id = useId();
  const type: LinkType = value?.type ?? "none";
  const types: LinkType[] = required ? ["page", "block", "url"] : ["none", "page", "block", "url"];

  function changeType(next: LinkType) {
    switch (next) {
      case "none":
        onChange(null);
        return;
      case "page":
        onChange(context.pages[0] ? { type: "page", page_id: context.pages[0].id } : null);
        return;
      case "block":
        onChange(context.blockOptions[0] ? { type: "block", block_id: context.blockOptions[0].id } : null);
        return;
      case "url":
        onChange({ type: "url", url: "" });
        return;
    }
  }

  return (
    <fieldset className="grid gap-2" aria-describedby={help ? `${id}-help` : undefined}>
      <legend className="mb-2 text-sm leading-none font-medium">{label}</legend>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <Select value={type} disabled={context.disabled} onValueChange={(next) => changeType(next as LinkType)}>
          <SelectTrigger aria-label={t("type")} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {types.map((option) => (
              <SelectItem key={option} value={option} disabled={option === "block" && context.blockOptions.length === 0}>
                {t(`types.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {value?.type === "page" ? (
          <Select value={value.page_id} disabled={context.disabled} onValueChange={(next) => onChange({ type: "page", page_id: next })}>
            <SelectTrigger aria-label={t("page")} className="w-full">
              <SelectValue placeholder={t("missingPage")} />
            </SelectTrigger>
            <SelectContent>
              {context.pages.map((page) => (
                <SelectItem key={page.id} value={page.id}>
                  {page.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        {value?.type === "block" ? (
          <Select value={value.block_id} disabled={context.disabled} onValueChange={(next) => onChange({ type: "block", block_id: next })}>
            <SelectTrigger aria-label={t("block")} className="w-full">
              <SelectValue placeholder={t("missingBlock")} />
            </SelectTrigger>
            <SelectContent>
              {context.blockOptions.map((block) => (
                <SelectItem key={block.id} value={block.id}>
                  {block.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        {value?.type === "url" ? (
          <Input
            type="url"
            aria-label={t("url")}
            aria-invalid={Boolean(error)}
            placeholder="https://"
            maxLength={2048}
            value={value.url}
            disabled={context.disabled}
            onChange={(event) => onChange({ type: "url", url: event.target.value })}
          />
        ) : null}
      </div>
      {help ? (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {help}
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </fieldset>
  );
}

/** Liste med elementer som kan legges til, flyttes, åpnes og fjernes. */
function ListField({
  spec,
  label,
  help,
  error,
  value,
  onChange,
  errors,
  path,
}: {
  spec: Extract<FieldSpec, { kind: "list" }>;
  label: string;
  help: string | undefined;
  error: string | undefined;
  value: Values[];
  onChange: (value: Values[]) => void;
  errors: Record<string, string>;
  path: string;
}) {
  const t = useTranslations("siteBuilder.editor.list");
  const tEditor = useTranslations("siteBuilder.editor");
  const context = useFieldContext();
  const id = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) {
      return;
    }
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item as Values);
    onChange(next);
    if (openIndex === index) {
      setOpenIndex(target);
    } else if (openIndex === target) {
      setOpenIndex(index);
    }
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
    setOpenIndex((current) => (current === null || current === index ? null : current > index ? current - 1 : current));
  }

  return (
    <section className="grid gap-2" aria-labelledby={`${id}-label`}>
      <div className="flex items-baseline justify-between gap-2">
        <h4 id={`${id}-label`} className="text-sm font-medium">
          {label}
        </h4>
        <span className="text-xs text-muted-foreground tabular-nums">{t("count", { count: value.length, max: spec.max })}</span>
      </div>
      {help ? <p className="text-sm text-muted-foreground">{help}</p> : null}
      {value.length === 0 ? (
        <p className="rounded-md border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ol className="grid gap-2">
          {value.map((item, index) => {
            const itemPath = `${path}.${index}`;
            const hasError = Object.keys(errors).some((key) => key.startsWith(`${itemPath}.`) || key === itemPath);
            const expanded = openIndex === index || hasError;
            const option = spec.titleOption ? item[spec.titleOption.key] : undefined;
            const name =
              listItemTitle(item, spec.titleKeys) ??
              (spec.titleOption && typeof option === "string" ? tEditor(`options.${spec.titleOption.options}.${option}` as "options.align.left") : null) ??
              t("item", { number: index + 1 });
            return (
              <li key={typeof item.id === "string" ? item.id : index} className="rounded-md border bg-background">
                <div className="flex items-center gap-1 py-1 pr-1 pl-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate rounded-sm py-1.5 text-left text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-expanded={expanded}
                    aria-controls={`${id}-${index}`}
                    onClick={() => setOpenIndex(expanded && !hasError ? null : index)}
                  >
                    {name}
                  </button>
                  {hasError ? <TriangleAlertIcon className="size-4 shrink-0 text-destructive" role="img" aria-label={t("hasErrors")} /> : null}
                  {!context.disabled ? (
                    <>
                      <Button type="button" variant="ghost" size="icon" className="size-8" disabled={index === 0} aria-label={t("moveUp", { name })} onClick={() => move(index, -1)}>
                        <ArrowUpIcon aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={index === value.length - 1}
                        aria-label={t("moveDown", { name })}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDownIcon aria-hidden="true" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t("remove", { name })} onClick={() => remove(index)}>
                        <Trash2Icon aria-hidden="true" />
                      </Button>
                    </>
                  ) : null}
                </div>
                {expanded ? (
                  <div id={`${id}-${index}`} className="border-t p-3">
                    <FieldList
                      specs={spec.fields}
                      values={item}
                      onChange={(next) => onChange(value.map((current, i) => (i === index ? next : current)))}
                      errors={errors}
                      path={itemPath}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!context.disabled ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          disabled={value.length >= spec.max}
          onClick={() => {
            onChange([...value, spec.newItem()]);
            setOpenIndex(value.length);
          }}
        >
          <PlusIcon aria-hidden="true" />
          {t(spec.addLabel as "addFigure")}
        </Button>
      ) : null}
    </section>
  );
}
