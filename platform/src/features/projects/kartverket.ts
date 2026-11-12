/**
 * Adressesøk og kartfliser fra Kartverket. Begge er gratis og krever ingen nøkkel.
 *
 *   * Adresser: https://ws.geonorge.no/adresser/v1/ (Matrikkelens adresseregister).
 *   * Kart: Kartverkets topografiske kart som WMTS-fliser i Web Mercator.
 *
 * Søket kjøres fra nettleseren, så serveren aldri trenger å nå Kartverket.
 */

import { z } from "zod";

export const KARTVERKET_ADDRESS_SEARCH_URL = "https://ws.geonorge.no/adresser/v1/sok";
export const KARTVERKET_TILE_URL = "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png";
export const KARTVERKET_ATTRIBUTION = "© Kartverket";

export type AddressSuggestion = {
  id: string;
  /** «Fjordveien 1, 0150 Oslo» */
  label: string;
  address: string;
  postalCode: string | null;
  city: string | null;
  municipality: string | null;
  lat: number | null;
  lng: number | null;
};

const SMALL_WORDS = new Set(["i", "og", "på"]);

/** Kartverket skriver poststed og kommune med store bokstaver: «SØR-AURDAL» blir «Sør-Aurdal». */
export function toTitleCase(value: string): string {
  return value
    .toLocaleLowerCase("nb")
    .split(" ")
    .map((word, index) =>
      index > 0 && SMALL_WORDS.has(word)
        ? word
        : word.replace(/(^|[-(/])(\p{L})/gu, (_match, before: string, letter: string) => before + letter.toLocaleUpperCase("nb")),
    )
    .join(" ");
}

const addressSchema = z.object({
  adressetekst: z.string(),
  adressekode: z.number().nullish(),
  kommunenummer: z.string().nullish(),
  kommunenavn: z.string().nullish(),
  postnummer: z.string().nullish(),
  poststed: z.string().nullish(),
  nummer: z.number().nullish(),
  bokstav: z.string().nullish(),
  representasjonspunkt: z.object({ lat: z.number(), lon: z.number() }).nullish(),
});

const responseSchema = z.object({ adresser: z.array(z.unknown()) });

export function parseAddressResponse(json: unknown): AddressSuggestion[] {
  const response = responseSchema.safeParse(json);
  if (!response.success) {
    return [];
  }
  const seen = new Set<string>();
  const suggestions: AddressSuggestion[] = [];
  for (const item of response.data.adresser) {
    const parsed = addressSchema.safeParse(item);
    if (!parsed.success) {
      continue;
    }
    const a = parsed.data;
    const postalCode = a.postnummer && /^\d{4}$/.test(a.postnummer) ? a.postnummer : null;
    const city = a.poststed ? toTitleCase(a.poststed) : null;
    const id = [a.kommunenummer, a.adressekode, a.nummer, a.bokstav, a.adressetekst].filter(Boolean).join("-");
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    suggestions.push({
      id,
      label: [a.adressetekst, [postalCode, city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
      address: a.adressetekst,
      postalCode,
      city,
      municipality: a.kommunenavn ? toTitleCase(a.kommunenavn) : null,
      lat: a.representasjonspunkt?.lat ?? null,
      lng: a.representasjonspunkt?.lon ?? null,
    });
  }
  return suggestions;
}

export function buildAddressSearchUrl(query: string, limit = 8): string {
  const params = new URLSearchParams({
    sok: query.trim(),
    fuzzy: "true",
    treffPerSide: String(limit),
    utkoordsys: "4258",
  });
  return `${KARTVERKET_ADDRESS_SEARCH_URL}?${params.toString()}`;
}

/** Søker etter adresser. Kaster ved nettverksfeil, så grensesnittet kan vise at søket ikke virket. */
export async function searchAddresses(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) {
    return [];
  }
  const response = await fetch(buildAddressSearchUrl(query), { signal, headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Kartverket svarte ${response.status}`);
  }
  return parseAddressResponse(await response.json());
}
