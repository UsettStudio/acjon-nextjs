"use client";

/* eslint-disable @next/next/no-img-element -- Plantegningene er ferdige WebP-varianter fra Storage. */

import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { imageSources } from "@/features/selector/components/hotspot-svg";
import { StatusPill } from "@/features/selector/components/public/unit-card";
import { useUnitFormat } from "@/features/selector/components/public/use-unit-format";
import type { PublicUnit } from "@/features/selector/model";
import type { UnitStatus } from "@/features/units/fields";
import { calculateTotals } from "@/features/units/price";

export const MAX_COMPARE = 3;

export function CompareDialog({
  open,
  onOpenChange,
  units,
  statusColors,
  unitHref,
  onRemove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  units: PublicUnit[];
  statusColors: Record<UnitStatus, string>;
  unitHref: ((unit: PublicUnit) => string) | null;
  onRemove: (unitId: string) => void;
}) {
  const t = useTranslations("publicSelector.compare");
  const tCard = useTranslations("publicSelector.card");
  const tCommon = useTranslations("common");
  const formatUnit = useUnitFormat();

  const rows: { label: string; value: (unit: PublicUnit) => React.ReactNode }[] = [
    { label: tCard("status"), value: (unit) => <StatusPill status={unit.status} color={statusColors[unit.status]} /> },
    { label: tCard("price"), value: (unit) => formatUnit.price(unit) },
    {
      label: tCard("total"),
      value: (unit) => {
        if (unit.price_hidden) {
          return "–";
        }
        const total = calculateTotals({ price: unit.price, purchaseCosts: unit.purchase_costs, sharedDebt: unit.shared_debt }).total;
        return total === null ? "–" : formatUnit.money(total);
      },
    },
    { label: tCard("rooms"), value: (unit) => unit.rooms ?? "–" },
    { label: tCard("bedrooms"), value: (unit) => unit.bedrooms ?? "–" },
    { label: tCard("braI"), value: (unit) => formatUnit.area(unit.bra_i) },
    { label: tCard("floor"), value: (unit) => unit.floor ?? "–" },
    { label: tCard("monthlyFee"), value: (unit) => (unit.monthly_fee === null ? "–" : formatUnit.money(unit.monthly_fee)) },
    { label: tCard("orientation"), value: (unit) => unit.orientation ?? "–" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tCommon("close")} className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description", { max: MAX_COMPARE })}</DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <caption className="sr-only">{t("title")}</caption>
            <thead>
              <tr>
                <td />
                {units.map((unit) => {
                  const plan = unit.floor_plan ? imageSources(unit.floor_plan) : null;
                  return (
                    <th key={unit.id} scope="col" className="p-2 text-left align-top">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-2">
                          {unitHref ? (
                            <a href={unitHref(unit)} className="font-semibold hover:underline">
                              {unit.unit_number}
                            </a>
                          ) : (
                            <span className="font-semibold">{unit.unit_number}</span>
                          )}
                          <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={t("remove", { unit: unit.unit_number })} onClick={() => onRemove(unit.id)}>
                            <XIcon aria-hidden="true" />
                          </Button>
                        </div>
                        {plan ? <img src={plan.src} srcSet={plan.srcSet} sizes="16rem" alt="" className="h-28 w-full rounded border bg-white object-contain" /> : null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t">
                  <th scope="row" className="p-2 text-left font-normal text-muted-foreground">
                    {row.label}
                  </th>
                  {units.map((unit) => (
                    <td key={unit.id} className="p-2 font-medium">
                      {row.value(unit)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
