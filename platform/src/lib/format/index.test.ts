import { describe, expect, it } from "vitest";

import { formatArea, formatCurrency, formatDate, formatNumber } from "@/lib/format";

// Intl bruker hardt mellomrom (U+00A0) som tusenskille. For lesbarhet i testene byttes det til vanlig mellomrom.
const plain = (value: string) => value.replaceAll(" ", " ").replaceAll(" ", " ");

describe("norsk format", () => {
  it("formaterer beløp som 2 450 000 kr", () => {
    expect(plain(formatCurrency(2450000))).toBe("2 450 000 kr");
    expect(plain(formatCurrency(0))).toBe("0 kr");
  });

  it("bruker hardt mellomrom, så beløp ikke brytes over to linjer", () => {
    expect(formatCurrency(2450000)).toContain(" ");
  });

  it("formaterer areal som 68 m² og 68,5 m²", () => {
    expect(plain(formatArea(68))).toBe("68 m²");
    expect(plain(formatArea(68.5))).toBe("68,5 m²");
    expect(plain(formatArea(1234.56))).toBe("1 234,6 m²");
  });

  it("formaterer tall med tusenskille", () => {
    expect(plain(formatNumber(1234567))).toBe("1 234 567");
  });

  it("formaterer dato i norsk tid", () => {
    expect(formatDate("2026-11-11T23:30:00Z")).toBe("12. nov. 2026");
  });
});
