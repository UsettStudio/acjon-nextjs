import { describe, expect, it } from "vitest";

import { mimeFromFile, originalPath, pickVariant, variantWidthsFor } from "@/features/media/model";

describe("variantWidthsFor", () => {
  it("lager 800, 1600 og 2400 for store bilder", () => {
    expect(variantWidthsFor(6000)).toEqual([800, 1600, 2400]);
    expect(variantWidthsFor(2400)).toEqual([800, 1600, 2400]);
  });

  it("forstørrer aldri, men tar med originalbredden", () => {
    expect(variantWidthsFor(2000)).toEqual([800, 1600, 2000]);
    expect(variantWidthsFor(1600)).toEqual([800, 1600]);
    expect(variantWidthsFor(640)).toEqual([640]);
  });
});

describe("mimeFromFile", () => {
  it("bruker filendelsen når nettleseren ikke oppgir type", () => {
    expect(mimeFromFile({ name: "Fasade.JPEG", type: "" })).toBe("image/jpeg");
    expect(mimeFromFile({ name: "prospekt.pdf", type: "application/pdf" })).toBe("application/pdf");
  });

  it("avviser SVG og andre typer", () => {
    expect(mimeFromFile({ name: "logo.svg", type: "image/svg+xml" })).toBeNull();
    expect(mimeFromFile({ name: "tegning.dwg", type: "" })).toBeNull();
  });
});

describe("stier og varianter", () => {
  it("legger originalen i filens egen mappe", () => {
    expect(originalPath("org", "fil", "image/png")).toBe("org/fil/original.png");
  });

  it("velger minste variant som er bred nok", () => {
    const variants = [
      { width: 2400, height: 1600, path: "c", bytes: 3 },
      { width: 800, height: 533, path: "a", bytes: 1 },
      { width: 1600, height: 1067, path: "b", bytes: 2 },
    ];
    expect(pickVariant(variants, 700)?.path).toBe("a");
    expect(pickVariant(variants, 1200)?.path).toBe("b");
    expect(pickVariant(variants, 5000)?.path).toBe("c");
    expect(pickVariant([], 100)).toBeNull();
  });
});
