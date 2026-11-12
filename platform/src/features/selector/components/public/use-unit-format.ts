"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

import type { PublicUnit } from "@/features/selector/model";

/** Felles formatering av pris, areal og etasje i den publiserte velgeren og på enhetssiden. */
export function useUnitFormat() {
  const format = useFormatter();
  const t = useTranslations("publicSelector.format");

  const money = useCallback(
    (value: number) => format.number(value, { style: "currency", currency: "NOK", maximumFractionDigits: 0 }),
    [format],
  );

  const price = useCallback(
    (unit: Pick<PublicUnit, "price" | "price_hidden">) => {
      if (unit.price_hidden) {
        return t("sold");
      }
      return unit.price === null ? t("priceComing") : money(unit.price);
    },
    [money, t],
  );

  const area = useCallback(
    (value: number | null) => (value === null ? "–" : t("area", { value: format.number(value, { maximumFractionDigits: 1 }) })),
    [format, t],
  );

  const floor = useCallback((value: number | null) => (value === null ? "–" : t("floor", { floor: value })), [t]);

  return useMemo(() => ({ money, price, area, floor }), [money, price, area, floor]);
}
