/**
 * Tolker tall slik de skrives i norske regneark og skjemaer:
 * «2 450 000», «2.450.000», «2 450 000 kr», «2450000,-», «68,5 m²» og «68.5».
 *
 * Regler:
 *   * Mellomrom (også hardt og smalt mellomrom) er tusenskille.
 *   * Med både punktum og komma er det siste tegnet desimalskille.
 *   * Ett komma er desimalskille («68,5»). Flere komma er tusenskille.
 *   * Flere punktum er tusenskille. Ett punktum fulgt av nøyaktig tre sifre er
 *     også tusenskille («2.450» = 2450), ellers desimalskille («68.5»).
 */

export type Parsed<T> = { ok: true; value: T } | { ok: false };

const ok = <T>(value: T): Parsed<T> => ({ ok: true, value });
const invalid = { ok: false } as const;

const SPACES = /[\s   ']/g;
const UNITS = /(kr\.?|nok|,-|\.-|m²|m2|kvm|%)$/;

export function parseNorwegianNumber(input: unknown): Parsed<number | null> {
  if (input === null || input === undefined) {
    return ok(null);
  }
  if (typeof input === "number") {
    return Number.isFinite(input) ? ok(input) : invalid;
  }
  if (typeof input !== "string") {
    return invalid;
  }

  let text = input.trim().toLowerCase();
  if (text === "" || text === "-") {
    return ok(null);
  }
  text = text.replace(/^kr\.?\s*/, "").replace(/^nok\s*/, "");
  // Enheter kan stå etter tallet, også flere: «2 450 000 kr,-».
  for (let i = 0; i < 3; i++) {
    text = text.trim().replace(UNITS, "");
  }
  text = text.replace(SPACES, "");
  if (text === "") {
    return invalid;
  }

  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? "," : ".";
    const thousands = decimal === "," ? "." : ",";
    text = text.replaceAll(thousands, "").replace(decimal, ".");
  } else if (lastComma >= 0) {
    const commas = text.split(",").length - 1;
    text = commas === 1 ? text.replace(",", ".") : text.replaceAll(",", "");
  } else if (lastDot >= 0) {
    const dots = text.split(".").length - 1;
    if (dots > 1 || /^-?\d{1,3}\.\d{3}$/.test(text)) {
      text = text.replaceAll(".", "");
    }
  }

  if (!/^-?\d+(\.\d+)?$/.test(text)) {
    return invalid;
  }
  const value = Number(text);
  return Number.isFinite(value) ? ok(value) : invalid;
}

/**
 * Hele tall for etasje: «3», «3.», «3. etg», «3. etasje», «U» eller «U1»
 * (underetasje = -1), «K» (kjeller = -1).
 */
export function parseFloor(input: unknown): Parsed<number | null> {
  if (input === null || input === undefined) {
    return ok(null);
  }
  if (typeof input === "number") {
    return Number.isInteger(input) ? ok(input) : invalid;
  }
  if (typeof input !== "string") {
    return invalid;
  }
  const text = input.trim().toLowerCase();
  if (text === "") {
    return ok(null);
  }
  const basement = /^([uk])\s*(\d*)$/.exec(text);
  if (basement) {
    return ok(-(basement[2] ? Number(basement[2]) : 1));
  }
  const floor = /^(-?\d+)\.?\s*(etg\.?|etasje|et\.?)?$/.exec(text);
  return floor?.[1] ? ok(Number(floor[1])) : invalid;
}

/** Ja/nei: «ja», «x», «1», «true», «skjult» er sant. «nei», «0», «false» er usant. */
export function parseBoolean(input: unknown): Parsed<boolean | null> {
  if (input === null || input === undefined) {
    return ok(null);
  }
  if (typeof input === "boolean") {
    return ok(input);
  }
  if (typeof input === "number") {
    return input === 1 ? ok(true) : input === 0 ? ok(false) : invalid;
  }
  if (typeof input !== "string") {
    return invalid;
  }
  const text = input.trim().toLowerCase();
  if (text === "") {
    return ok(null);
  }
  if (["ja", "j", "x", "1", "true", "yes", "y", "sann", "skjult", "hidden", "dold"].includes(text)) {
    return ok(true);
  }
  if (["nei", "n", "0", "false", "no", "usann", "synlig", "visible", "nej"].includes(text)) {
    return ok(false);
  }
  return invalid;
}

/** Normaliserer tekst for sammenligning: små bokstaver, uten aksenter og tegnsetting. Beholder æ, ø og å. */
export function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "o")
    .replace(/[å]/g, "a")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
