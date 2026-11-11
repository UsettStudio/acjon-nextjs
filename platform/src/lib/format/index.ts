/**
 * Tall, beløp og datoer i norsk format: 2 450 000 kr og 68 m².
 * Intl bruker hardt mellomrom (U+00A0) som tusenskille, slik at tall ikke brytes over to linjer.
 */

export type FormatLocale = "nb" | "en" | "sv";

const INTL_LOCALE: Record<FormatLocale, string> = {
  nb: "nb-NO",
  en: "en-GB",
  sv: "sv-SE",
};

export function formatNumber(value: number, locale: FormatLocale = "nb", maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], { maximumFractionDigits }).format(value);
}

/** Beløp i hele kroner: «2 450 000 kr». */
export function formatCurrency(value: number, locale: FormatLocale = "nb"): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Areal med inntil én desimal: «68 m²», «68,5 m²». */
export function formatArea(value: number, locale: FormatLocale = "nb"): string {
  return `${formatNumber(value, locale, 1)} m²`;
}

/** Dato som «11. nov. 2026». */
export function formatDate(value: string | Date, locale: FormatLocale = "nb"): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: "medium", timeZone: "Europe/Oslo" }).format(
    typeof value === "string" ? new Date(value) : value,
  );
}

/** Dato og klokkeslett som «11. nov. 2026, 14:05». */
export function formatDateTime(value: string | Date, locale: FormatLocale = "nb"): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Oslo",
  }).format(typeof value === "string" ? new Date(value) : value);
}
