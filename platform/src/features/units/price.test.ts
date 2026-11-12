import { describe, expect, it } from "vitest";

import { adjustPrice, calculateTotals } from "@/features/units/price";

describe("calculateTotals", () => {
  it("totalpris er pris pluss omkostninger", () => {
    expect(calculateTotals({ price: 4_250_000, purchaseCosts: 106_250, sharedDebt: null })).toEqual({
      total: 4_356_250,
      totalWithSharedDebt: null,
    });
  });

  it("viser totalpris med fellesgjeld bare når fellesgjelden er over 0", () => {
    expect(calculateTotals({ price: 2_450_000, purchaseCosts: 12_500, sharedDebt: 1_200_000 })).toEqual({
      total: 2_462_500,
      totalWithSharedDebt: 3_662_500,
    });
    expect(calculateTotals({ price: 2_450_000, purchaseCosts: 12_500, sharedDebt: 0 }).totalWithSharedDebt).toBeNull();
  });

  it("regner manglende omkostninger som 0", () => {
    expect(calculateTotals({ price: 3_900_000, purchaseCosts: null, sharedDebt: null }).total).toBe(3_900_000);
  });

  it("gir ingen totalpris uten pris", () => {
    expect(calculateTotals({ price: null, purchaseCosts: 100_000, sharedDebt: 500_000 })).toEqual({
      total: null,
      totalWithSharedDebt: null,
    });
  });
});

describe("adjustPrice", () => {
  it("endrer pris i prosent og avrunder som databasen", () => {
    expect(adjustPrice(4_500_000, 3, 1000)).toBe(4_635_000);
    expect(adjustPrice(3_900_000, 3, 1000)).toBe(4_017_000);
    expect(adjustPrice(2_450_000, -2.5, 10_000)).toBe(2_390_000);
    expect(adjustPrice(1_234_567, 10, 1)).toBe(1_358_024);
  });
});
