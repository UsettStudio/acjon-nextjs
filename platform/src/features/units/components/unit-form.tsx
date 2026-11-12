"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, CircleAlertIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { MediaAsset } from "@/features/media/assets";
import { AssetListField } from "@/features/media/components/asset-list-field";
import type { Building, Stage } from "@/features/projects/queries";
import { changeUnitStatus, deleteUnits, saveUnit } from "@/features/units/actions";
import { DeleteUnitsDialog, StatusDialog } from "@/features/units/components/table/dialogs";
import { UnitStatusBadge } from "@/features/units/components/unit-status-badge";
import {
  coerceUnitField,
  OWNERSHIP_TYPES,
  UNIT_STATUSES,
  UNIT_TYPES,
  type UnitRow,
  type UnitStatus,
} from "@/features/units/fields";
import { CustomFieldsEditor } from "@/features/units/components/custom-fields-editor";
import { customFieldsToInput } from "@/features/units/custom-fields";
import { calculateTotals } from "@/features/units/price";
import type { UnitListItem } from "@/features/units/queries";
import { createUnitSchema, type UnitFormInput, type UnitFormOutput } from "@/features/units/schemas";
import type { CommonActionError } from "@/lib/actions/result";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const TABS = ["key", "price", "area", "media", "documents", "description", "custom"] as const;
type Tab = (typeof TABS)[number];

/** Feltene i hver fane, så fanen med feil kan vises når skjemaet sendes. */
const TAB_FIELDS: Record<Tab, (keyof UnitFormInput)[]> = {
  key: [
    "unit_number",
    "title",
    "unit_type",
    "status",
    "stage_id",
    "building_id",
    "floor",
    "rooms",
    "bedrooms",
    "bathrooms",
    "ownership_type",
    "orientation",
    "parking",
    "storage",
    "external_id",
    "is_hidden",
  ],
  price: ["price", "purchase_costs", "shared_debt", "monthly_fee"],
  area: ["bra_i", "bra_e", "bra_b", "tba", "plot_area"],
  media: ["floor_plan_asset_ids", "gallery_asset_ids"],
  documents: ["document_asset_ids"],
  description: ["description"],
  custom: ["custom_fields"],
};

const NONE = "__none__";

const numberText = (value: number | null, decimals = 0) => (value === null ? "" : formatNumber(value, "nb", decimals));

function defaultValues(unit: UnitRow | null): UnitFormInput {
  return {
    unit_number: unit?.unit_number ?? "",
    title: unit?.title ?? "",
    unit_type: unit?.unit_type ?? "apartment",
    status: unit?.status ?? "available",
    floor: numberText(unit?.floor ?? null),
    rooms: numberText(unit?.rooms ?? null),
    bedrooms: numberText(unit?.bedrooms ?? null),
    bathrooms: numberText(unit?.bathrooms ?? null),
    bra_i: numberText(unit?.bra_i ?? null, 1),
    bra_e: numberText(unit?.bra_e ?? null, 1),
    bra_b: numberText(unit?.bra_b ?? null, 1),
    tba: numberText(unit?.tba ?? null, 1),
    plot_area: numberText(unit?.plot_area ?? null, 1),
    price: numberText(unit?.price ?? null),
    purchase_costs: numberText(unit?.purchase_costs ?? null),
    shared_debt: numberText(unit?.shared_debt ?? null),
    monthly_fee: numberText(unit?.monthly_fee ?? null),
    ownership_type: unit?.ownership_type ?? "",
    orientation: unit?.orientation ?? "",
    parking: unit?.parking ?? "",
    storage: unit?.storage ?? "",
    description: unit?.description ?? "",
    external_id: unit?.external_id ?? "",
    is_hidden: unit?.is_hidden ?? false,
    stage_id: unit?.stage_id ?? "",
    building_id: unit?.building_id ?? "",
    floor_plan_asset_ids: unit?.floor_plan_asset_ids ?? [],
    gallery_asset_ids: unit?.gallery_asset_ids ?? [],
    document_asset_ids: unit?.document_asset_ids ?? [],
    custom_fields: customFieldsToInput(unit?.custom_fields),
  };
}

function firstTabWithError(errors: FieldErrors<UnitFormInput>): Tab | null {
  return TABS.find((tab) => TAB_FIELDS[tab].some((field) => errors[field] !== undefined)) ?? null;
}

export function UnitForm({
  organizationId,
  orgSlug,
  projectId,
  projectSlug,
  unit,
  stages,
  buildings,
  assets,
  canEditContent,
  canSell,
  customFieldNames = [],
}: {
  organizationId: string;
  orgSlug: string;
  projectId: string;
  projectSlug: string;
  unit: UnitRow | null;
  stages: Stage[];
  buildings: Building[];
  assets: MediaAsset[];
  canEditContent: boolean;
  canSell: boolean;
  /** Navn på egne felt som brukes i prosjektet, som forslag. */
  customFieldNames?: string[];
}) {
  const t = useTranslations("units.form");
  const tFields = useTranslations("units.fields");
  const tTypes = useTranslations("units.types");
  const tOwnership = useTranslations("units.ownership");
  const tStatus = useTranslations("units.status");
  const tErrors = useTranslations("errors");
  const tUnits = useTranslations("units");
  const validation = useValidationMessage();
  const router = useRouter();
  const id = useId();
  const [tab, setTab] = useState<Tab>("key");
  const [pending, startTransition] = useTransition();
  const [assetMap, setAssetMap] = useState(() => new Map(assets.map((asset) => [asset.id, asset])));
  const [statusOpen, setStatusOpen] = useState<UnitListItem[] | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<UnitListItem[] | null>(null);
  const isNew = unit === null;
  const listBase = `/${orgSlug}/projects/${projectSlug}/units`;

  // Status valideres også for eksisterende enheter, men lagres bare for nye (se saveUnit).
  const form = useForm<UnitFormInput, unknown, UnitFormOutput>({
    resolver: zodResolver(createUnitSchema),
    defaultValues: defaultValues(unit),
  });
  const translateSpecific = (code: string) =>
    code === "unitNumberTaken" || code === "slugTaken" ? tUnits(`errors.${code}`) : undefined;
  const { formError, setFormError, apply } = useActionErrors(form, translateSpecific);
  const { errors } = form.formState;
  const error = (field: keyof UnitFormInput) => validation(errors[field]?.message as string | undefined);

  const [priceRaw, costsRaw, debtRaw] = useWatch({ control: form.control, name: ["price", "purchase_costs", "shared_debt"] });
  const parseAmount = (raw: unknown) => {
    const result = coerceUnitField("price", raw);
    return result.ok ? result.value : null;
  };
  const totals = calculateTotals({ price: parseAmount(priceRaw), purchaseCosts: parseAmount(costsRaw), sharedDebt: parseAmount(debtRaw) });

  const contentDisabled = !canEditContent;
  const salesDisabled = !canSell;

  const onSubmit = form.handleSubmit(
    () => {
      setFormError(null);
      const raw = form.getValues();
      startTransition(async () => {
        const result = await saveUnit({ organizationId, orgSlug, projectId, projectSlug, unitId: unit?.id ?? null, input: raw });
        if (!result) {
          return;
        }
        if (result.ok) {
          toast.success(t("saved"));
          form.reset(raw);
        } else {
          apply(result);
          const fields = Object.keys(result.fieldErrors ?? {});
          const errorTab = TABS.find((candidate) =>
            TAB_FIELDS[candidate].some((field) => fields.some((key) => key === field || key.startsWith(`${field}.`))),
          );
          if (errorTab) {
            setTab(errorTab);
          }
        }
      });
    },
    (invalid) => {
      const errorTab = firstTabWithError(invalid);
      if (errorTab) {
        setTab(errorTab);
      }
    },
  );

  const tabHasError = (candidate: Tab) => TAB_FIELDS[candidate].some((field) => errors[field] !== undefined);

  function assetField(name: "floor_plan_asset_ids" | "gallery_asset_ids" | "document_asset_ids", kind: "image" | "document", max: number) {
    return (
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <AssetListField
            label={t(`assets.${name}`)}
            description={t(`assets.${name}Help`)}
            organizationId={organizationId}
            projectId={projectId}
            kind={kind}
            max={max}
            disabled={contentDisabled}
            value={field.value.flatMap((id) => {
              const asset = assetMap.get(id);
              return asset ? [asset] : [];
            })}
            onChange={(next) => {
              setAssetMap((previous) => {
                const map = new Map(previous);
                for (const asset of next) {
                  map.set(asset.id, asset);
                }
                return map;
              });
              field.onChange(next.map((asset) => asset.id));
            }}
          />
        )}
      />
    );
  }

  const numberInput = (name: keyof UnitFormInput, disabled: boolean, suffix?: string) => (
    <Field name={`unit-${name}`} label={tFields(name as "price")} error={error(name)}>
      {(field) => (
        <div className="relative">
          <Input {...field} inputMode="decimal" disabled={disabled} className={cn(suffix && "pr-12")} {...form.register(name)} />
          {suffix ? (
            <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </div>
      )}
    </Field>
  );

  const textInput = (name: keyof UnitFormInput, disabled: boolean, description?: string) => (
    <Field name={`unit-${name}`} label={tFields(name as "title")} description={description} error={error(name)}>
      {(field) => <Input {...field} disabled={disabled} {...form.register(name)} />}
    </Field>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={listBase}>
              <ArrowLeftIcon aria-hidden="true" />
              {t("back")}
            </Link>
          </Button>
          <h2 className="text-xl font-semibold">{isNew ? t("newTitle") : t("editTitle", { unit: unit.unit_number })}</h2>
          {unit ? <UnitStatusBadge status={unit.status} /> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {unit && canSell ? (
            <Button type="button" variant="outline" onClick={() => setStatusOpen([unit])}>
              {tStatus("change")}
            </Button>
          ) : null}
          {unit && canEditContent ? (
            <Button type="button" variant="outline" className="text-destructive" onClick={() => setDeleteOpen([unit])}>
              <Trash2Icon aria-hidden="true" />
              {t("delete")}
            </Button>
          ) : null}
          {canSell ? <SubmitButton pending={pending}>{isNew ? t("create") : t("save")}</SubmitButton> : null}
        </div>
      </div>
      {!canEditContent && canSell ? <p className="text-sm text-muted-foreground">{t("agentHelp")}</p> : null}
      <FormAlert message={formError} />

      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <TabsList aria-label={t("tabsLabel")}>
          {TABS.map((candidate) => (
            <TabsTrigger key={candidate} value={candidate}>
              {t(`tabs.${candidate}`)}
              {tabHasError(candidate) ? (
                <>
                  <CircleAlertIcon aria-hidden="true" className="text-destructive" />
                  <span className="sr-only">{t("tabHasErrors")}</span>
                </>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="key" className="grid max-w-4xl gap-5 sm:grid-cols-2">
          {textInput("unit_number", contentDisabled, t("unitNumberHelp"))}
          {textInput("title", contentDisabled, t("titleHelp"))}
          <Controller
            control={form.control}
            name="unit_type"
            render={({ field }) => (
              <Field name="unit-type" label={tFields("unit_type")} error={error("unit_type")}>
                {(control) => (
                  <Select value={String(field.value)} onValueChange={field.onChange} disabled={contentDisabled}>
                    <SelectTrigger {...control} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {tTypes(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
            )}
          />
          {isNew ? (
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Field name="unit-status" label={tFields("status")} error={error("status")}>
                  {(control) => (
                    <Select value={field.value} onValueChange={(value) => field.onChange(value as UnitStatus)}>
                      <SelectTrigger {...control} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {tStatus(`values.${status}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
              )}
            />
          ) : null}
          {stages.length > 0 ? (
            <Controller
              control={form.control}
              name="stage_id"
              render={({ field }) => (
                <Field name="unit-stage" label={tFields("stage")} error={error("stage_id")}>
                  {(control) => (
                    <Select
                      value={field.value ? String(field.value) : NONE}
                      onValueChange={(value) => field.onChange(value === NONE ? "" : value)}
                      disabled={contentDisabled}
                    >
                      <SelectTrigger {...control} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>{t("none")}</SelectItem>
                        {stages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
              )}
            />
          ) : null}
          {buildings.length > 0 ? (
            <Controller
              control={form.control}
              name="building_id"
              render={({ field }) => (
                <Field name="unit-building" label={tFields("building")} error={error("building_id")}>
                  {(control) => (
                    <Select
                      value={field.value ? String(field.value) : NONE}
                      onValueChange={(value) => field.onChange(value === NONE ? "" : value)}
                      disabled={contentDisabled}
                    >
                      <SelectTrigger {...control} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>{t("none")}</SelectItem>
                        {buildings.map((building) => (
                          <SelectItem key={building.id} value={building.id}>
                            {building.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
              )}
            />
          ) : null}
          {numberInput("floor", contentDisabled)}
          {numberInput("rooms", contentDisabled)}
          {numberInput("bedrooms", contentDisabled)}
          {numberInput("bathrooms", contentDisabled)}
          <Controller
            control={form.control}
            name="ownership_type"
            render={({ field }) => (
              <Field name="unit-ownership" label={tFields("ownership_type")} error={error("ownership_type")}>
                {(control) => (
                  <Select
                    value={field.value ? String(field.value) : NONE}
                    onValueChange={(value) => field.onChange(value === NONE ? "" : value)}
                    disabled={contentDisabled}
                  >
                    <SelectTrigger {...control} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{t("none")}</SelectItem>
                      {OWNERSHIP_TYPES.map((ownership) => (
                        <SelectItem key={ownership} value={ownership}>
                          {tOwnership(ownership)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
            )}
          />
          {textInput("orientation", contentDisabled, t("orientationHelp"))}
          {textInput("parking", contentDisabled)}
          {textInput("storage", contentDisabled)}
          {textInput("external_id", contentDisabled, t("externalIdHelp"))}
          <Controller
            control={form.control}
            name="is_hidden"
            render={({ field }) => (
              <div className="flex items-start gap-3 sm:col-span-2">
                <Checkbox
                  id={`${id}-hidden`}
                  checked={field.value}
                  disabled={contentDisabled}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  aria-describedby={`${id}-hidden-help`}
                />
                <div className="grid gap-1">
                  <Label htmlFor={`${id}-hidden`}>{tFields("is_hidden")}</Label>
                  <p id={`${id}-hidden-help`} className="text-sm text-muted-foreground">
                    {t("hiddenHelp")}
                  </p>
                </div>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="price" className="grid max-w-4xl gap-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {numberInput("price", salesDisabled, "kr")}
            {numberInput("purchase_costs", salesDisabled, "kr")}
            {numberInput("shared_debt", salesDisabled, "kr")}
            {numberInput("monthly_fee", salesDisabled, "kr")}
          </div>
          <dl className="grid gap-3 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2" aria-live="polite">
            <div>
              <dt className="text-sm text-muted-foreground">{tFields("total")}</dt>
              <dd className="text-xl font-semibold tabular-nums">{totals.total === null ? "–" : formatCurrency(totals.total)}</dd>
              <dd className="text-xs text-muted-foreground">{t("totalHelp")}</dd>
            </div>
            {totals.totalWithSharedDebt !== null ? (
              <div>
                <dt className="text-sm text-muted-foreground">{tFields("total_with_debt")}</dt>
                <dd className="text-xl font-semibold tabular-nums">{formatCurrency(totals.totalWithSharedDebt)}</dd>
                <dd className="text-xs text-muted-foreground">{t("totalWithDebtHelp")}</dd>
              </div>
            ) : null}
          </dl>
        </TabsContent>

        <TabsContent value="area" className="grid max-w-4xl gap-5">
          <p className="text-sm text-muted-foreground">{t("areaHelp")}</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {numberInput("bra_i", contentDisabled, "m²")}
            {numberInput("bra_e", contentDisabled, "m²")}
            {numberInput("bra_b", contentDisabled, "m²")}
            {numberInput("tba", contentDisabled, "m²")}
            {numberInput("plot_area", contentDisabled, "m²")}
          </div>
        </TabsContent>

        <TabsContent value="media" className="grid max-w-3xl gap-8">
          {assetField("floor_plan_asset_ids", "image", 20)}
          {assetField("gallery_asset_ids", "image", 100)}
        </TabsContent>

        <TabsContent value="documents" className="grid max-w-3xl gap-8">
          {assetField("document_asset_ids", "document", 50)}
        </TabsContent>

        <TabsContent value="description" className="grid max-w-3xl gap-3">
          <Field name="unit-description" label={tFields("description")} description={t("descriptionHelp")} error={error("description")}>
            {(field) => <Textarea {...field} rows={12} disabled={contentDisabled} {...form.register("description")} />}
          </Field>
        </TabsContent>

        <TabsContent value="custom" className="grid max-w-3xl gap-3">
          <CustomFieldsEditor
            control={form.control}
            register={form.register}
            errors={errors}
            disabled={contentDisabled}
            suggestions={customFieldNames}
          />
        </TabsContent>
      </Tabs>

      {unit ? (
        <>
          <StatusDialog
            units={statusOpen}
            onClose={() => setStatusOpen(null)}
            onSubmit={async (units, status, note) => {
              const result = await changeUnitStatus({
                organizationId,
                unitIds: units.map((item) => item.id),
                status,
                note,
                source: "form",
              });
              if (result.ok) {
                toast.success(tStatus("changed", { count: 1, unit: unit.unit_number, status: tStatus(`values.${status}`) }));
                return true;
              }
              toast.error(tErrors(result.error as CommonActionError));
              return false;
            }}
          />
          <DeleteUnitsDialog
            units={deleteOpen}
            onClose={() => setDeleteOpen(null)}
            onConfirm={async (units) => {
              const result = await deleteUnits(
                organizationId,
                units.map((item) => item.id),
              );
              if (result.ok) {
                toast.success(tUnits("delete.done", { count: result.data.deleted }));
                router.push(listBase);
                return true;
              }
              toast.error(tErrors(result.error as CommonActionError));
              return false;
            }}
          />
        </>
      ) : null}
    </form>
  );
}
