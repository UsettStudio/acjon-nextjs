/**
 * Prisberegning for en enhet.
 *
 *   Totalpris = pris + omkostninger.
 *   Har enheten fellesgjeld (over 0), vises også totalpris inkludert fellesgjeld.
 *
 * Beløp er hele kroner. Mangler prisen, finnes ingen totalpris.
 */

export type UnitPriceInput = {
  price: number | null;
  purchaseCosts: number | null;
  sharedDebt: number | null;
};

export type UnitTotals = {
  /** Pris + omkostninger. */
  total: number | null;
  /** Pris + omkostninger + fellesgjeld. Bare når fellesgjelden er over 0. */
  totalWithSharedDebt: number | null;
};

export function calculateTotals({ price, purchaseCosts, sharedDebt }: UnitPriceInput): UnitTotals {
  if (price === null) {
    return { total: null, totalWithSharedDebt: null };
  }
  const total = price + (purchaseCosts ?? 0);
  const totalWithSharedDebt = sharedDebt !== null && sharedDebt > 0 ? total + sharedDebt : null;
  return { total, totalWithSharedDebt };
}

/** Ny pris etter prosentendring, avrundet til nærmeste `roundTo` kroner. Samme regel som adjust_unit_prices i databasen. */
export function adjustPrice(price: number, percent: number, roundTo: number): number {
  // (100 + prosent) / 100 gir færre avrundingsfeil enn 1 + prosent / 100 for hele prosenter.
  return Math.round((price * (100 + percent)) / 100 / roundTo) * roundTo;
}

export const PRICE_ROUNDING = [1, 10, 100, 1000, 10000] as const;
export type PriceRounding = (typeof PRICE_ROUNDING)[number];
