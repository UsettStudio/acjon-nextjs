import { describe, expect, it } from "vitest";

import { buildAddressSearchUrl, parseAddressResponse, toTitleCase } from "@/features/projects/kartverket";

describe("toTitleCase", () => {
  it("skriver stedsnavn med stor forbokstav", () => {
    expect(toTitleCase("OSLO")).toBe("Oslo");
    expect(toTitleCase("NORDRE FOLLO")).toBe("Nordre Follo");
    expect(toTitleCase("SØR-AURDAL")).toBe("Sør-Aurdal");
    expect(toTitleCase("ÅLESUND")).toBe("Ålesund");
    expect(toTitleCase("BØ I TELEMARK")).toBe("Bø i Telemark");
    expect(toTitleCase("HERØY (MØRE OG ROMSDAL)")).toBe("Herøy (Møre og Romsdal)");
  });
});

describe("parseAddressResponse", () => {
  it("gjør Kartverkets svar om til adresseforslag", () => {
    const suggestions = parseAddressResponse({
      metadata: { totaltAntallTreff: 2 },
      adresser: [
        {
          adressetekst: "Fjordveien 1",
          adressekode: 12345,
          nummer: 1,
          bokstav: "",
          kommunenummer: "0301",
          kommunenavn: "OSLO",
          postnummer: "0150",
          poststed: "OSLO",
          representasjonspunkt: { epsg: "EPSG:4258", lat: 59.9075, lon: 10.7398 },
        },
        { adressetekst: "Fjordveien 1", adressekode: 12345, nummer: 1, bokstav: "", kommunenummer: "0301" },
        { feil: "mangler adressetekst" },
      ],
    });
    expect(suggestions).toEqual([
      {
        id: "0301-12345-1-Fjordveien 1",
        label: "Fjordveien 1, 0150 Oslo",
        address: "Fjordveien 1",
        postalCode: "0150",
        city: "Oslo",
        municipality: "Oslo",
        lat: 59.9075,
        lng: 10.7398,
      },
    ]);
  });

  it("tåler uventede svar", () => {
    expect(parseAddressResponse(null)).toEqual([]);
    expect(parseAddressResponse({ adresser: "ingen" })).toEqual([]);
  });
});

describe("buildAddressSearchUrl", () => {
  it("bygger søket med uklar treff og koordinater i grader", () => {
    const url = new URL(buildAddressSearchUrl(" Fjordveien 1 "));
    expect(url.origin + url.pathname).toBe("https://ws.geonorge.no/adresser/v1/sok");
    expect(url.searchParams.get("sok")).toBe("Fjordveien 1");
    expect(url.searchParams.get("fuzzy")).toBe("true");
    expect(url.searchParams.get("utkoordsys")).toBe("4258");
  });
});
