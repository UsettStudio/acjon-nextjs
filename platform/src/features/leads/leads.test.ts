import { describe, expect, it } from "vitest";

import { consentTexts, CURRENT_CONSENT_VERSION } from "@/features/leads/consent";
import { buildLeadsCsv, LEAD_EXPORT_COLUMNS, type LeadExportRow } from "@/features/leads/export";
import { leadFilterParams, parseLeadFilters, searchTerm } from "@/features/leads/filters";

const PROJECT = "00000000-0000-4000-8000-000000000001";

describe("filtre i leadslisten", () => {
  it("leser gyldige filtre og ignorerer resten", () => {
    expect(parseLeadFilters({ status: "contacted", project: PROJECT, unit: "ikke-en-id", q: "  kari  ", page: "3" })).toEqual({
      status: "contacted",
      projectId: PROJECT,
      unitId: null,
      search: "kari",
      page: 3,
    });
    expect(parseLeadFilters({ status: "slettet", page: "-2" })).toMatchObject({ status: null, page: 1 });
    expect(parseLeadFilters(new URLSearchParams("page=99999")).page).toBe(1000);
  });

  it("skriver filtrene tilbake til adressen uten tomme verdier", () => {
    const params = leadFilterParams({ status: "new", projectId: PROJECT, unitId: null, search: "", page: 1 });
    expect(params.toString()).toBe(`status=new&project=${PROJECT}`);
    expect(parseLeadFilters(params)).toMatchObject({ status: "new", projectId: PROJECT });
  });

  it("fjerner tegn som har egen betydning i søkefilteret", () => {
    expect(searchTerm("kari,(nordmann)*%")).toBe("kari nordmann");
    expect(searchTerm("a_b\\c")).toBe("a b c");
  });
});

describe("CSV-eksport av leads", () => {
  const row: LeadExportRow = {
    createdAt: "2026-11-12T10:00:00Z",
    name: "=Kari",
    email: "kari@example.test",
    phone: "+47 912 34 567",
    projectName: "Solsiden",
    unitNumber: "A-302",
    status: "new",
    source: "unit_page",
    message: "Er balkongen; mot sør?",
    consentContact: true,
    consentSimilar: false,
    consentVersion: CURRENT_CONSENT_VERSION,
    consentedAt: "2026-11-12T10:00:00Z",
    utm: { utm_source: "finn" },
    internalNote: null,
  };
  const csv = buildLeadsCsv([row], {
    header: (column) => column,
    status: (status) => `status:${status}`,
    source: (source) => `kilde:${source}`,
    dateTime: (iso) => iso.slice(0, 10),
    yes: "Ja",
    no: "Nei",
  });

  it("har BOM, semikolon og én kolonne per felt", () => {
    expect(csv.startsWith("﻿")).toBe(true);
    const [header] = csv.slice(1).split("\r\n");
    expect(header?.split(";")).toHaveLength(LEAD_EXPORT_COLUMNS.length);
  });

  it("verner mot formler, siterer semikolon og oversetter verdier", () => {
    expect(csv).toContain("'=Kari");
    expect(csv).toContain('"Er balkongen; mot sør?"');
    expect(csv).toContain("status:new");
    expect(csv).toContain("kilde:unit_page");
    expect(csv).toContain(";Ja;Nei;");
    expect(csv).toContain("finn");
  });
});

describe("samtykketekster", () => {
  it("fyller inn organisasjon og prosjekt på riktig språk", () => {
    const texts = consentTexts("en", { organization: "Demo Bolig AS", project: "Fjordparken" });
    expect(texts.contact).toContain("Demo Bolig AS");
    expect(texts.contact).toContain("Fjordparken");
    expect(texts.contact.startsWith("I agree")).toBe(true);
  });

  it("bruker bokmål for ukjent språk og gjeldende versjon for ukjent versjon", () => {
    expect(consentTexts("de", { organization: "A", project: "B" }).contact.startsWith("Jeg samtykker")).toBe(true);
    expect(consentTexts("nb", { organization: "A", project: "B" }, "finnes-ikke")).toEqual(consentTexts("nb", { organization: "A", project: "B" }));
    expect(consentTexts("nb", { organization: "A", project: "B" }, "constructor")).toEqual(consentTexts("nb", { organization: "A", project: "B" }));
  });
});
