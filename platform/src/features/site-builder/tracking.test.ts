import { describe, expect, it } from "vitest";

import { analyticsIdsSchema, compactAnalyticsIds } from "@/features/projects/analytics";
import { cookieSettingsSchema, parseCookieSettings, parseTrackingIds } from "@/features/site-builder/site";
import {
  CONSENT_MAX_AGE_MS,
  categoriesInUse,
  consentWithdrawn,
  googleConsentState,
  hasTracking,
  isTrackingCookie,
  parseStoredConsent,
  scriptsAllowed,
  serializeConsent,
} from "@/features/site-builder/tracking";

const all = { ga4: "G-ABC123XYZ", gtm: "GTM-ABCD12", metaPixel: "1234567890" };
const none = { ga4: null, gtm: null, metaPixel: null };
const now = new Date("2026-11-13T10:00:00Z");

describe("sporingskoder", () => {
  it("godtar bare gyldige koder, også om databasen skulle sende noe annet", () => {
    expect(parseTrackingIds({ ga4: "G-ABC123XYZ", gtm: "GTM-ABCD12", meta_pixel: "1234567890" })).toEqual(all);
    expect(parseTrackingIds({ ga4: "G-1');alert(1)//", gtm: 5, meta_pixel: "12ab" })).toEqual(none);
    expect(parseTrackingIds(null)).toEqual(none);
  });

  it("renser skjemaet og lagrer bare kodene som er fylt ut", () => {
    const parsed = analyticsIdsSchema.parse({ ga4: " g-abc123xyz ", gtm: "", meta_pixel: "1234567890" });
    expect(parsed).toEqual({ ga4: "G-ABC123XYZ", gtm: "", meta_pixel: "1234567890" });
    expect(compactAnalyticsIds(parsed)).toEqual({ ga4: "G-ABC123XYZ", meta_pixel: "1234567890" });
    const invalid = analyticsIdsSchema.safeParse({ ga4: "UA-12345-1", gtm: "GTM-1", meta_pixel: "abc" });
    expect(invalid.success).toBe(false);
    expect(invalid.error?.issues.map((issue) => issue.message).sort()).toEqual(["ga4Invalid", "gtmInvalid", "metaPixelInvalid"]);
  });
});

describe("personverninnstillinger", () => {
  it("har tomme standardverdier og kontrollerer organisasjonsnummer og e-post", () => {
    expect(parseCookieSettings(undefined)).toEqual({ controller: "", org_number: "", email: "", extra: "" });
    expect(cookieSettingsSchema.safeParse({ org_number: "912 345 678", email: "personvern@utbygger.no" }).success).toBe(true);
    expect(cookieSettingsSchema.safeParse({ org_number: "12345" }).success).toBe(false);
    expect(cookieSettingsSchema.safeParse({ email: "ikke-epost" }).success).toBe(false);
  });
});

describe("samtykke", () => {
  it("viser bare kategoriene prosjektet bruker", () => {
    expect(hasTracking(none)).toBe(false);
    expect(categoriesInUse({ ...none, ga4: "G-ABC123XYZ" })).toEqual({ statistics: true, marketing: false });
    expect(categoriesInUse({ ...none, metaPixel: "1234567890" })).toEqual({ statistics: false, marketing: true });
    expect(categoriesInUse({ ...none, gtm: "GTM-ABCD12" })).toEqual({ statistics: true, marketing: true });
  });

  it("laster ingenting uten samtykke, og bare det som er samtykket til", () => {
    expect(scriptsAllowed(all, null)).toEqual({ ga4: false, gtm: false, metaPixel: false });
    expect(scriptsAllowed(all, { statistics: false, marketing: false })).toEqual({ ga4: false, gtm: false, metaPixel: false });
    expect(scriptsAllowed(all, { statistics: true, marketing: false })).toEqual({ ga4: true, gtm: true, metaPixel: false });
    expect(scriptsAllowed(all, { statistics: false, marketing: true })).toEqual({ ga4: false, gtm: true, metaPixel: true });
  });

  it("gir Google Consent Mode samme valg", () => {
    expect(googleConsentState({ statistics: true, marketing: false })).toEqual({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });

  it("husker valget i tolv måneder og spør på nytt etter det", () => {
    const stored = serializeConsent({ statistics: true, marketing: false }, now);
    expect(parseStoredConsent(stored, now)).toMatchObject({ statistics: true, marketing: false });
    expect(parseStoredConsent(stored, new Date(now.getTime() + CONSENT_MAX_AGE_MS + 1000))).toBeNull();
    expect(parseStoredConsent('{"version":0,"statistics":true,"marketing":true,"decidedAt":"2026-11-13T10:00:00Z"}', now)).toBeNull();
    expect(parseStoredConsent("ikke json", now)).toBeNull();
    expect(parseStoredConsent(null, now)).toBeNull();
  });

  it("ser når et samtykke trekkes tilbake", () => {
    expect(consentWithdrawn({ statistics: true, marketing: true }, { statistics: false, marketing: true })).toBe(true);
    expect(consentWithdrawn({ statistics: false, marketing: false }, { statistics: true, marketing: true })).toBe(false);
    expect(consentWithdrawn(null, { statistics: false, marketing: false })).toBe(false);
  });

  it("kjenner igjen informasjonskapslene fra Google og Meta", () => {
    for (const name of ["_ga", "_ga_ABC123", "_gid", "_gat_UA-1", "_gcl_au", "_fbp", "_fbc"]) {
      expect(isTrackingCookie(name)).toBe(true);
    }
    expect(isTrackingCookie("sb-access-token")).toBe(false);
    expect(isTrackingCookie("last_org")).toBe(false);
  });
});
