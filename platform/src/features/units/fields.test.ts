import { describe, expect, it } from "vitest";

import { coerceUnitField, compareUnitNumbers } from "@/features/units/fields";

describe("coerceUnitField", () => {
  it("tolker beløp i norsk format til hele kroner", () => {
    expect(coerceUnitField("price", "2 450 000 kr")).toEqual({ ok: true, value: 2_450_000 });
    expect(coerceUnitField("price", 2_450_000.4)).toEqual({ ok: true, value: 2_450_000 });
    expect(coerceUnitField("price", "")).toEqual({ ok: true, value: null });
    expect(coerceUnitField("price", "-5")).toEqual({ ok: false, error: "numberNotNegative" });
    expect(coerceUnitField("price", "mye")).toEqual({ ok: false, error: "numberInvalid" });
  });

  it("runder areal til én desimal", () => {
    expect(coerceUnitField("bra_i", "68,54")).toEqual({ ok: true, value: 68.5 });
    expect(coerceUnitField("bra_i", "54,25 m²")).toEqual({ ok: true, value: 54.3 });
  });

  it("krever hele tall for rom og etasje", () => {
    expect(coerceUnitField("rooms", "3")).toEqual({ ok: true, value: 3 });
    expect(coerceUnitField("rooms", "2,5")).toEqual({ ok: false, error: "wholeNumber" });
    expect(coerceUnitField("floor", "2. etg")).toEqual({ ok: true, value: 2 });
    expect(coerceUnitField("floor", "U")).toEqual({ ok: true, value: -1 });
    expect(coerceUnitField("floor", "300")).toEqual({ ok: false, error: "floorRange" });
    expect(coerceUnitField("floor", "tak")).toEqual({ ok: false, error: "floorInvalid" });
  });

  it("forstår status på norsk, engelsk og svensk", () => {
    expect(coerceUnitField("status", "Ledig")).toEqual({ ok: true, value: "available" });
    expect(coerceUnitField("status", "Til salgs")).toEqual({ ok: true, value: "available" });
    expect(coerceUnitField("status", "SOLGT")).toEqual({ ok: true, value: "sold" });
    expect(coerceUnitField("status", "Opsjon")).toEqual({ ok: true, value: "reserved" });
    expect(coerceUnitField("status", "reserved")).toEqual({ ok: true, value: "reserved" });
    expect(coerceUnitField("status", "Såld")).toEqual({ ok: true, value: "sold" });
    expect(coerceUnitField("status", "Kommer for salg")).toEqual({ ok: true, value: "upcoming" });
    expect(coerceUnitField("status", "")).toEqual({ ok: true, value: null });
    expect(coerceUnitField("status", "Kanskje")).toEqual({ ok: false, error: "optionInvalid" });
  });

  it("forstår boligtype og eierform", () => {
    expect(coerceUnitField("unit_type", "Leilighet")).toEqual({ ok: true, value: "apartment" });
    expect(coerceUnitField("unit_type", "Rekkehus")).toEqual({ ok: true, value: "townhouse" });
    expect(coerceUnitField("unit_type", "Tomannsbolig")).toEqual({ ok: true, value: "semi_detached" });
    expect(coerceUnitField("unit_type", "semi_detached")).toEqual({ ok: true, value: "semi_detached" });
    expect(coerceUnitField("unit_type", "Næringslokale")).toEqual({ ok: true, value: "commercial" });
    expect(coerceUnitField("ownership_type", "Borettslag")).toEqual({ ok: true, value: "andel" });
    expect(coerceUnitField("ownership_type", "Selveier")).toEqual({ ok: true, value: "selveier" });
  });

  it("trimmer tekst og krever enhetsnummer", () => {
    expect(coerceUnitField("unit_number", "  A-101 ")).toEqual({ ok: true, value: "A-101" });
    expect(coerceUnitField("unit_number", 101)).toEqual({ ok: true, value: "101" });
    expect(coerceUnitField("unit_number", " ")).toEqual({ ok: false, error: "required" });
    expect(coerceUnitField("unit_number", "x".repeat(41))).toEqual({ ok: false, error: "textTooLong" });
    expect(coerceUnitField("title", "  Toppleilighet   med   utsikt ")).toEqual({
      ok: true,
      value: "Toppleilighet med utsikt",
    });
    expect(coerceUnitField("description", "Linje 1\r\nLinje 2  ")).toEqual({ ok: true, value: "Linje 1\nLinje 2" });
  });

  it("tolker skjult som ja/nei", () => {
    expect(coerceUnitField("is_hidden", "Ja")).toEqual({ ok: true, value: true });
    expect(coerceUnitField("is_hidden", false)).toEqual({ ok: true, value: false });
  });
});

describe("compareUnitNumbers", () => {
  it("sorterer tall i enhetsnummer etter verdi", () => {
    expect(["A-10", "A-2", "a-1", "B-1", "A-101"].sort(compareUnitNumbers)).toEqual(["a-1", "A-2", "A-10", "A-101", "B-1"]);
  });
});
