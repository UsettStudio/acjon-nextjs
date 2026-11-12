/**
 * Samtykke og sporing på publiserte prosjektsider.
 *
 *   - Nødvendige funksjoner (interesseskjema, favoritter, samtykkevalget) virker alltid.
 *   - Statistikk: Google Analytics 4 og Google Tag Manager.
 *   - Markedsføring: Meta Pixel. Tag Manager får også markedsføringssamtykket
 *     gjennom Google Consent Mode, så taggene i containeren følger valget.
 *
 * Ingen sporingskode lastes før besøkeren har samtykket. Banneret vises bare når
 * prosjektet har sporingskoder; uten sporing trengs ikke samtykke.
 */

import type { SiteTracking } from "@/features/site-builder/site";

export const CONSENT_STORAGE_KEY = "samtykke";
/** Øk når teksten eller kategoriene endres vesentlig, så alle blir spurt på nytt. */
export const CONSENT_VERSION = 1;
/** Valget gjelder i tolv måneder. Deretter spørres besøkeren på nytt. */
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
/** Åpner banneret igjen («Endre samtykke» i bunnteksten og på personvernsidene). */
export const OPEN_CONSENT_EVENT = "samtykke:apne";

export type ConsentChoice = { statistics: boolean; marketing: boolean };
export type StoredConsent = ConsentChoice & { version: number; decidedAt: string };

export function hasTracking(tracking: SiteTracking): boolean {
  return Boolean(tracking.ga4 || tracking.gtm || tracking.metaPixel);
}

/** Kategoriene prosjektet faktisk bruker. Bare disse vises i banneret. */
export function categoriesInUse(tracking: SiteTracking): ConsentChoice {
  return {
    statistics: Boolean(tracking.ga4 || tracking.gtm),
    marketing: Boolean(tracking.metaPixel || tracking.gtm),
  };
}

export function parseStoredConsent(raw: string | null, now: Date = new Date()): StoredConsent | null {
  if (!raw) {
    return null;
  }
  try {
    const value = JSON.parse(raw) as Partial<StoredConsent>;
    if (
      value.version !== CONSENT_VERSION ||
      typeof value.statistics !== "boolean" ||
      typeof value.marketing !== "boolean" ||
      typeof value.decidedAt !== "string"
    ) {
      return null;
    }
    const decided = new Date(value.decidedAt).getTime();
    if (!Number.isFinite(decided) || now.getTime() - decided > CONSENT_MAX_AGE_MS || decided > now.getTime() + 60_000) {
      return null;
    }
    return { version: value.version, statistics: value.statistics, marketing: value.marketing, decidedAt: value.decidedAt };
  } catch {
    return null;
  }
}

export function serializeConsent(choice: ConsentChoice, now: Date = new Date()): string {
  const stored: StoredConsent = {
    version: CONSENT_VERSION,
    statistics: choice.statistics,
    marketing: choice.marketing,
    decidedAt: now.toISOString(),
  };
  return JSON.stringify(stored);
}

/** Hvilke skript som kan lastes med dette samtykket. */
export function scriptsAllowed(tracking: SiteTracking, consent: ConsentChoice | null): { ga4: boolean; gtm: boolean; metaPixel: boolean } {
  return {
    ga4: Boolean(tracking.ga4 && consent?.statistics),
    gtm: Boolean(tracking.gtm && (consent?.statistics || consent?.marketing)),
    metaPixel: Boolean(tracking.metaPixel && consent?.marketing),
  };
}

/** Samtykket i formatet til Google Consent Mode v2. */
export function googleConsentState(consent: ConsentChoice): Record<string, "granted" | "denied"> {
  const statistics = consent.statistics ? "granted" : "denied";
  const marketing = consent.marketing ? "granted" : "denied";
  return { analytics_storage: statistics, ad_storage: marketing, ad_user_data: marketing, ad_personalization: marketing };
}

/** Et samtykke er trukket tilbake når noe som var tillatt, ikke er det lenger. */
export function consentWithdrawn(before: ConsentChoice | null, after: ConsentChoice): boolean {
  return Boolean(before && ((before.statistics && !after.statistics) || (before.marketing && !after.marketing)));
}

/** Informasjonskapsler fra Google og Meta som slettes når samtykket trekkes tilbake. */
export function isTrackingCookie(name: string): boolean {
  return /^(_ga|_ga_.+|_gid|_gat.*|_gcl_.+|_fbp|_fbc)$/.test(name);
}
