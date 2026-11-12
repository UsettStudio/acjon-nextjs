"use client";

/* eslint-disable @next/next/no-img-element -- Plantegningen er en ferdig WebP-variant fra Storage. */

import { ArrowRightIcon, HeartIcon, LocateFixedIcon, MailIcon, ScaleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { imageSources } from "@/features/selector/components/hotspot-svg";
import { useUnitFormat } from "@/features/selector/components/public/use-unit-format";
import type { PublicUnit } from "@/features/selector/model";
import type { UnitStatus } from "@/features/units/fields";
import { calculateTotals } from "@/features/units/price";
import { cn } from "@/lib/utils";

export function StatusPill({ status, color }: { status: UnitStatus; color: string }) {
  const t = useTranslations("unitStatus");
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium" data-testid="unit-status">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {t(status)}
    </span>
  );
}

/**
 * Kortet som åpnes ved klikk på en bolig. Vises som et ark nederst på mobil
 * og som en dialog på større skjermer.
 */
export function UnitCard({
  unit,
  statusColors,
  unitHref,
  interestHref = null,
  favorite,
  comparing,
  compareFull,
  canLocate,
  onClose,
  onToggleFavorite,
  onToggleCompare,
  onLocate,
}: {
  unit: PublicUnit | null;
  statusColors: Record<UnitStatus, string>;
  /** null i forhåndsvisningen: enhetssiden finnes først når velgeren er publisert. */
  unitHref: ((unit: PublicUnit) => string) | null;
  /** Interesseskjemaet for enheten. Uten denne vises ikke «Meld interesse». */
  interestHref?: ((unit: PublicUnit) => string) | null;
  favorite: boolean;
  comparing: boolean;
  compareFull: boolean;
  /** Enheten er markert i en annen visning enn den som vises. */
  canLocate: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onToggleCompare: () => void;
  onLocate: () => void;
}) {
  const t = useTranslations("publicSelector.card");
  const tCommon = useTranslations("common");
  const formatUnit = useUnitFormat();
  const totals = unit && !unit.price_hidden ? calculateTotals({ price: unit.price, purchaseCosts: unit.purchase_costs, sharedDebt: unit.shared_debt }) : null;
  const plan = unit?.floor_plan ? imageSources(unit.floor_plan) : null;

  const facts: { label: string; value: string }[] = unit
    ? [
        { label: t("rooms"), value: unit.rooms?.toString() ?? "–" },
        { label: t("bedrooms"), value: unit.bedrooms?.toString() ?? "–" },
        { label: t("braI"), value: formatUnit.area(unit.bra_i) },
        { label: t("floor"), value: unit.floor?.toString() ?? "–" },
        ...(unit.bra_e !== null ? [{ label: t("braE"), value: formatUnit.area(unit.bra_e) }] : []),
        ...(unit.monthly_fee !== null ? [{ label: t("monthlyFee"), value: formatUnit.money(unit.monthly_fee) }] : []),
      ]
    : [];

  return (
    <Dialog open={unit !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent
        closeLabel={tCommon("close")}
        className="gap-4 sm:max-w-lg max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[88svh] max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none max-sm:p-5"
        data-testid="unit-card"
      >
        {unit ? (
          <>
            <span className="mx-auto -mt-2 h-1.5 w-10 rounded-full bg-muted sm:hidden" aria-hidden="true" />
            <DialogHeader className="text-left">
              <div className="flex flex-wrap items-center gap-2 pr-6">
                <DialogTitle>{unit.title ? `${unit.unit_number} – ${unit.title}` : unit.unit_number}</DialogTitle>
                <StatusPill status={unit.status} color={statusColors[unit.status]} />
              </div>
              <DialogDescription className="text-base font-semibold text-foreground">{formatUnit.price(unit)}</DialogDescription>
            </DialogHeader>
            {plan && unit.floor_plan ? (
              <img
                src={plan.src}
                srcSet={plan.srcSet}
                sizes="(min-width: 640px) 32rem, 100vw"
                alt={unit.floor_plan.alt ?? t("floorPlanAlt", { unit: unit.unit_number })}
                className="max-h-64 w-full rounded-md border bg-white object-contain"
              />
            ) : null}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
              {totals?.total !== null && totals?.total !== undefined ? (
                <div>
                  <dt className="text-xs text-muted-foreground">{t("total")}</dt>
                  <dd className="font-medium">{formatUnit.money(totals.total)}</dd>
                </div>
              ) : null}
            </dl>
            <div className="flex flex-wrap gap-2">
              {unitHref ? (
                <Button asChild>
                  <a href={unitHref(unit)} data-testid="unit-card-link">
                    {t("viewUnit")}
                    <ArrowRightIcon aria-hidden="true" />
                  </a>
                </Button>
              ) : null}
              {interestHref && unit.status !== "sold" ? (
                <Button asChild variant="outline">
                  <a href={interestHref(unit)} data-testid="unit-card-interest">
                    <MailIcon aria-hidden="true" />
                    {t("interest")}
                  </a>
                </Button>
              ) : null}
              <Button type="button" variant="outline" aria-pressed={favorite} onClick={onToggleFavorite}>
                <HeartIcon className={cn(favorite && "fill-rose-500 text-rose-500")} aria-hidden="true" />
                {favorite ? t("favorited") : t("favorite")}
              </Button>
              <Button type="button" variant="outline" aria-pressed={comparing} disabled={!comparing && compareFull} onClick={onToggleCompare}>
                <ScaleIcon aria-hidden="true" />
                {comparing ? t("comparing") : t("compare")}
              </Button>
              {canLocate ? (
                <Button type="button" variant="ghost" onClick={onLocate}>
                  <LocateFixedIcon aria-hidden="true" />
                  {t("locate")}
                </Button>
              ) : null}
            </div>
            {!comparing && compareFull ? <p className="text-xs text-muted-foreground">{t("compareFull")}</p> : null}
            {unitHref ? null : <p className="text-xs text-muted-foreground">{t("previewNoUnitPage")}</p>}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
