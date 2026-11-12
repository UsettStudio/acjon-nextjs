import { describe, expect, it } from "vitest";

import { normalizeLabel, parseBoolean, parseFloor, parseNorwegianNumber } from "@/lib/format/parse";

const value = (input: unknown) => {
  const result = parseNorwegianNumber(input);
  return result.ok ? result.value : "ugyldig";
};

describe("parseNorwegianNumber", () => {
  it("tolker beløp med mellomrom, punktum og kr", () => {
    expect(value("2 450 000")).toBe(2450000);
    expect(value("2 450 000 kr")).toBe(2450000);
    expect(value("2 450 000")).toBe(2450000);
    expect(value("2.450.000")).toBe(2450000);
    expect(value("kr 2 450 000,-")).toBe(2450000);
    expect(value("2450000,-")).toBe(2450000);
    expect(value("NOK 2,450,000")).toBe(2450000);
    expect(value("2 450 000 kr,-")).toBe(2450000);
  });

  it("tolker desimaler med komma og punktum", () => {
    expect(value("68,5")).toBe(68.5);
    expect(value("68.5")).toBe(68.5);
    expect(value("68,5 m²")).toBe(68.5);
    expect(value("68.5 m2")).toBe(68.5);
    expect(value("1 234,56")).toBe(1234.56);
    expect(value("1.234,56")).toBe(1234.56);
    expect(value("1,234.56")).toBe(1234.56);
  });

  it("tolker ett punktum med tre sifre etter som tusenskille", () => {
    expect(value("2.450")).toBe(2450);
    expect(value("54.25")).toBe(54.25);
  });

  it("tolker ett komma som desimalskille, også med tre sifre etter", () => {
    expect(value("68,500")).toBe(68.5);
  });

  it("gir null for tomme verdier og beholder tall", () => {
    expect(value("")).toBeNull();
    expect(value("   ")).toBeNull();
    expect(value("-")).toBeNull();
    expect(value(null)).toBeNull();
    expect(value(undefined)).toBeNull();
    expect(value(3500)).toBe(3500);
    expect(value(-2)).toBe(-2);
    expect(value("-2")).toBe(-2);
  });

  it("avviser tekst som ikke er tall", () => {
    expect(value("ca. 2 mill")).toBe("ugyldig");
    expect(value("abc")).toBe("ugyldig");
    expect(value("1,2,3.4.5")).toBe("ugyldig");
    expect(value("kr")).toBe("ugyldig");
    expect(value(Number.NaN)).toBe("ugyldig");
    expect(value({})).toBe("ugyldig");
  });
});

describe("parseFloor", () => {
  const floor = (input: unknown) => {
    const result = parseFloor(input);
    return result.ok ? result.value : "ugyldig";
  };

  it("tolker etasjer slik de ofte skrives", () => {
    expect(floor("3")).toBe(3);
    expect(floor("3.")).toBe(3);
    expect(floor("3. etg")).toBe(3);
    expect(floor("3. etasje")).toBe(3);
    expect(floor(" 12 ")).toBe(12);
    expect(floor(2)).toBe(2);
    expect(floor("-1")).toBe(-1);
  });

  it("tolker underetasje og kjeller som minus", () => {
    expect(floor("U")).toBe(-1);
    expect(floor("U2")).toBe(-2);
    expect(floor("K")).toBe(-1);
  });

  it("gir null for tomt og avviser desimaler og tekst", () => {
    expect(floor("")).toBeNull();
    expect(floor(null)).toBeNull();
    expect(floor(2.5)).toBe("ugyldig");
    expect(floor("tredje")).toBe("ugyldig");
  });
});

describe("parseBoolean", () => {
  it("tolker ja og nei på flere språk", () => {
    expect(parseBoolean("Ja")).toEqual({ ok: true, value: true });
    expect(parseBoolean("x")).toEqual({ ok: true, value: true });
    expect(parseBoolean("Skjult")).toEqual({ ok: true, value: true });
    expect(parseBoolean("nei")).toEqual({ ok: true, value: false });
    expect(parseBoolean(0)).toEqual({ ok: true, value: false });
    expect(parseBoolean("")).toEqual({ ok: true, value: null });
    expect(parseBoolean("kanskje")).toEqual({ ok: false });
  });
});

describe("normalizeLabel", () => {
  it("fjerner tegnsetting og gjør æ, ø og å sammenlignbare", () => {
    expect(normalizeLabel("Pris (kr)")).toBe("pris kr");
    expect(normalizeLabel("Bruksareal BRA-i")).toBe("bruksareal bra i");
    expect(normalizeLabel("Bodstørrelse")).toBe("bodstorrelse");
    expect(normalizeLabel("Felleskost./mnd.")).toBe("felleskost mnd");
    expect(normalizeLabel("Årlig")).toBe("arlig");
  });
});
