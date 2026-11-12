import { describe, expect, it } from "vitest";

import { buildUnitsCsv, csvNumber, csvText, type ExportColumn, type ExportUnit } from "@/features/units/export";
import { matchHeader, suggestMapping } from "@/features/units/import/columns";
import { decodeCsv, parseCsv, SpreadsheetError, toSpreadsheet } from "@/features/units/import/spreadsheet";
import { MAX_IMPORT_ROWS, validateImport } from "@/features/units/import/validate";
import { parseUnitPatch } from "@/features/units/schemas";

describe("kolonnekobling", () => {
  it("kjenner igjen vanlige overskrifter på norsk, engelsk og svensk", () => {
    expect(matchHeader("Leilighet nr.")).toBe("unit_number");
    expect(matchHeader("Enhetsnummer")).toBe("unit_number");
    expect(matchHeader("Lägenhetsnummer")).toBe("unit_number");
    expect(matchHeader("Pris (kr)")).toBe("price");
    expect(matchHeader("Prisantydning")).toBe("price");
    expect(matchHeader("Felleskost./mnd.")).toBe("monthly_fee");
    expect(matchHeader("Felleskostnader per måned")).toBe("monthly_fee");
    expect(matchHeader("BRA-i (m²)")).toBe("bra_i");
    expect(matchHeader("P-rom")).toBe("bra_i");
    expect(matchHeader("Antall soverom")).toBe("bedrooms");
    expect(matchHeader("Etg.")).toBe("floor");
    expect(matchHeader("Byggetrinn")).toBe("stage");
    expect(matchHeader("Status")).toBe("status");
    expect(matchHeader("Monthly fee")).toBe("monthly_fee");
  });

  it("kobler ikke totalpris til pris, og ukjente overskrifter til ingenting", () => {
    expect(matchHeader("Totalpris")).toBeNull();
    expect(matchHeader("Kommentar fra megler")).toBeNull();
    expect(matchHeader("")).toBeNull();
  });

  it("bruker hvert felt bare én gang", () => {
    expect(suggestMapping(["Nr", "Pris", "Salgspris", "Rom"])).toEqual(["unit_number", "price", null, "rooms"]);
  });
});

describe("regneark", () => {
  it("leser CSV med semikolon, BOM og tomme rader", () => {
    const sheet = parseCsv("﻿Nr;Pris;Status\r\nA-101;2 450 000;Ledig\r\n\r\nA-102;\"3 100 000\";Solgt\r\n");
    expect(sheet.headers).toEqual(["Nr", "Pris", "Status"]);
    expect(sheet.rows).toEqual([
      ["A-101", "2 450 000", "Ledig"],
      ["A-102", "3 100 000", "Solgt"],
    ]);
  });

  it("leser CSV med komma", () => {
    expect(parseCsv("Nr,Rom\nA-1,3\n").rows).toEqual([["A-1", "3"]]);
  });

  it("hopper over tomme rader øverst og tomme kolonner til høyre", () => {
    const sheet = toSpreadsheet([
      [null, null, null],
      ["Nr", "Pris", null],
      ["A-1", 2450000, ""],
      [null, null, null],
    ]);
    expect(sheet.headers).toEqual(["Nr", "Pris"]);
    expect(sheet.rows).toEqual([["A-1", 2450000]]);
  });

  it("finner overskriften under en tittelrad", () => {
    const sheet = toSpreadsheet([
      ["Prisliste Fjordparken", null, null],
      [null, null, null],
      ["Bolignr", "Etasje", "Pris"],
      ["B-101", 1, 3285000],
    ]);
    expect(sheet.headers).toEqual(["Bolignr", "Etasje", "Pris"]);
    expect(sheet.rows).toEqual([["B-101", 1, 3285000]]);
    expect(suggestMapping(sheet.headers)).toEqual(["unit_number", "floor", "price"]);
  });

  it("godtar regneark med bare én kolonne", () => {
    expect(toSpreadsheet([["Nr"], ["A-1"]]).rows).toEqual([["A-1"]]);
  });

  it("avviser tomme filer og filer med for mange rader", () => {
    expect(() => toSpreadsheet([["Nr"]])).toThrow(SpreadsheetError);
    const many = [["Nr"], ...Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, i) => [`A-${i}`])];
    expect(() => toSpreadsheet(many)).toThrow("tooManyRows");
  });

  it("leser CSV fra Excel lagret som Windows-1252", () => {
    const bytes = new Uint8Array([0x4e, 0x72, 0x3b, 0x42, 0x6f, 0x64, 0x0a, 0x31, 0x3b, 0x53, 0xf8, 0x72]); // «Nr;Bod\n1;Sør»
    expect(decodeCsv(bytes.buffer)).toBe("Nr;Bod\n1;Sør");
  });
});

describe("validering av importrader", () => {
  const mapping = ["unit_number", "price", "status", "floor", null] as const;

  it("tolker verdier og finner feil per rad", () => {
    const result = validateImport(
      [
        ["A-101", "2 450 000", "Ledig", "1", "ignoreres"],
        ["A-102", "mye", "Solgt", "2", ""],
        ["", "100", "Ledig", "1", ""],
        ["A-101", "1", "Ledig", "3", ""],
        ["", "", "", "", ""],
      ],
      [...mapping],
    );
    expect(result.rows).toHaveLength(4);
    expect(result.rows[0]).toEqual({
      line: 2,
      unitNumber: "A-101",
      values: { unit_number: "A-101", price: 2450000, status: "available", floor: 1 },
      errors: [],
    });
    expect(result.rows[1]?.errors).toEqual([{ field: "price", message: "numberInvalid" }]);
    expect(result.rows[2]?.errors).toEqual([{ field: "unit_number", message: "required" }]);
    expect(result.rows[3]?.errors).toEqual([{ field: "unit_number", message: "duplicateInFile" }]);
    expect(result.errorCount).toBe(3);
    expect(result.validRows.map((row) => row.line)).toEqual([2]);
  });

  it("tar tall og datoer fra Excel som de er", () => {
    const result = validateImport([["B-1", 3100000, "Reservert", 2, null]], [...mapping]);
    expect(result.rows[0]?.values).toEqual({ unit_number: "B-1", price: 3100000, status: "reserved", floor: 2 });
  });
});

describe("eksport", () => {
  const unit: ExportUnit = {
    unit_number: "A-101",
    title: "=Toppleilighet",
    unit_type: "apartment",
    status: "sold",
    stage_id: "s1",
    building_id: null,
    floor: 1,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    bra_i: 68.5,
    bra_e: null,
    bra_b: null,
    tba: 8,
    plot_area: null,
    price: 4250000,
    purchase_costs: 106250,
    shared_debt: null,
    monthly_fee: 3500,
    ownership_type: "selveier",
    orientation: "Sørvest; kveldssol",
    parking: null,
    storage: "Bod i kjeller",
    description: "Lys leilighet.\nUtsikt mot fjorden.",
    external_id: null,
    is_hidden: false,
  };

  it("formaterer tall og beskytter mot formler", () => {
    expect(csvNumber(68.5)).toBe("68,5");
    expect(csvNumber(null)).toBe("");
    expect(csvText("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(csvText("-1")).toBe("'-1");
    expect(csvText("A-101")).toBe("A-101");
  });

  it("lager CSV som kan importeres igjen med samme verdier", () => {
    const labels = {
      header: (column: ExportColumn) =>
        ({
          unit_number: "Enhetsnummer",
          title: "Tittel",
          unit_type: "Type",
          status: "Status",
          stage: "Byggetrinn",
          building: "Bygg",
          floor: "Etasje",
          rooms: "Rom",
          bedrooms: "Soverom",
          bathrooms: "Bad",
          bra_i: "BRA-i (m²)",
          bra_e: "BRA-e (m²)",
          bra_b: "BRA-b (m²)",
          tba: "TBA (m²)",
          plot_area: "Tomteareal (m²)",
          price: "Pris",
          purchase_costs: "Omkostninger",
          shared_debt: "Fellesgjeld",
          monthly_fee: "Felleskostnader per måned",
          total: "Totalpris",
          ownership_type: "Eierform",
          orientation: "Solforhold",
          parking: "Parkering",
          storage: "Bod",
          description: "Beskrivelse",
          external_id: "Ekstern id",
          is_hidden: "Skjult",
        })[column],
      status: () => "Solgt",
      type: () => "Leilighet",
      ownership: () => "Selveier",
      yes: "Ja",
      no: "Nei",
    };
    const csv = buildUnitsCsv([unit], labels, { stages: new Map([["s1", "Trinn 1"]]), buildings: new Map() });
    expect(csv.startsWith("﻿Enhetsnummer;Tittel;Type;Status;Byggetrinn;")).toBe(true);
    expect(csv).toContain('"Sørvest; kveldssol"');
    expect(csv).toContain(";4356250;");

    const sheet = parseCsv(csv);
    const mapping = suggestMapping(sheet.headers);
    expect(mapping[sheet.headers.indexOf("Totalpris")]).toBeNull();
    const result = validateImport(sheet.rows, mapping);
    expect(result.errorCount).toBe(0);
    expect(result.rows[0]?.values).toMatchObject({
      unit_number: "A-101",
      title: "=Toppleilighet",
      unit_type: "apartment",
      status: "sold",
      stage: "Trinn 1",
      building: null,
      floor: 1,
      bra_i: 68.5,
      tba: 8,
      price: 4250000,
      purchase_costs: 106250,
      monthly_fee: 3500,
      ownership_type: "selveier",
      orientation: "Sørvest; kveldssol",
      description: "Lys leilighet.\nUtsikt mot fjorden.",
      is_hidden: false,
    });
  });
});

describe("endring av felt i tabellen", () => {
  it("tolker verdien og avviser ukjente felt", () => {
    expect(parseUnitPatch({ price: "2 450 000" })).toEqual({ ok: true, patch: { price: 2450000 } });
    expect(parseUnitPatch({ stage_id: "" })).toEqual({ ok: true, patch: { stage_id: null } });
    expect(parseUnitPatch({ organization_id: "x" })).toEqual({ ok: false, fieldErrors: { organization_id: "optionInvalid" } });
    expect(parseUnitPatch({ status: "sold" })).toEqual({ ok: false, fieldErrors: { status: "optionInvalid" } });
  });

  it("lar ikke påkrevde felt bli tomme", () => {
    expect(parseUnitPatch({ unit_number: " " })).toEqual({ ok: false, fieldErrors: { unit_number: "required" } });
    expect(parseUnitPatch({ unit_type: "" })).toEqual({ ok: false, fieldErrors: { unit_type: "required" } });
    expect(parseUnitPatch({})).toEqual({ ok: false, fieldErrors: { _form: "required" } });
  });
});
