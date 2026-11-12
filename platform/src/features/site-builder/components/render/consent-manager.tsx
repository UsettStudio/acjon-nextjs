"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { LEAD_SUBMITTED_EVENT } from "@/features/leads/events";
import type { SiteTracking } from "@/features/site-builder/site";
import {
  CONSENT_STORAGE_KEY,
  OPEN_CONSENT_EVENT,
  categoriesInUse,
  consentWithdrawn,
  googleConsentState,
  isTrackingCookie,
  parseStoredConsent,
  scriptsAllowed,
  serializeConsent,
  type ConsentChoice,
} from "@/features/site-builder/tracking";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const CONSENT_CHANGED_EVENT = "samtykke:endret";
/** Brukes når nettleseren ikke tillater localStorage (enkelte private vinduer). */
let memoryConsent: string | null = null;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CONSENT_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CONSENT_CHANGED_EVENT, callback);
  };
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? memoryConsent;
  } catch {
    return memoryConsent;
  }
}

/** På serveren er valget ukjent. Da vises ikke banneret, så det ikke blinker for dem som har valgt. */
const SERVER = "server";

function storeConsent(choice: ConsentChoice) {
  const value = serializeConsent(choice);
  memoryConsent = value;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Privat modus eller full lagring: valget gjelder til siden lukkes.
  }
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}

function loadScript(id: string, src: string) {
  if (document.getElementById(id)) {
    return;
  }
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.append(script);
}

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtagShim() {
      // gtag.js krever at selve arguments-objektet legges i dataLayer.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  window.gtag(...args);
}

/** Laster skriptene samtykket tillater. Hvert skript lastes bare én gang per sidevisning. */
function applyConsent(tracking: SiteTracking, consent: ConsentChoice) {
  const allowed = scriptsAllowed(tracking, consent);
  if (allowed.ga4 || allowed.gtm) {
    if (!document.getElementById("google-consent")) {
      gtag("consent", "default", { ...googleConsentState(consent), wait_for_update: 500 });
      const marker = document.createElement("meta");
      marker.id = "google-consent";
      document.head.append(marker);
    } else {
      gtag("consent", "update", googleConsentState(consent));
    }
  }
  if (allowed.ga4 && tracking.ga4) {
    if (!document.getElementById("ga4-script")) {
      gtag("js", new Date());
      gtag("config", tracking.ga4);
    }
    loadScript("ga4-script", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tracking.ga4)}`);
  }
  if (allowed.gtm && tracking.gtm) {
    if (!document.getElementById("gtm-script")) {
      window.dataLayer = window.dataLayer ?? [];
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    }
    loadScript("gtm-script", `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(tracking.gtm)}`);
  }
  if (allowed.metaPixel && tracking.metaPixel) {
    if (!window.fbq) {
      const fbq = function fbqShim(...args: unknown[]) {
        if (fbq.callMethod) {
          fbq.callMethod(...args);
        } else {
          fbq.queue.push(args);
        }
      } as Fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      window.fbq = fbq;
      window._fbq = window._fbq ?? fbq;
      fbq("init", tracking.metaPixel);
      fbq("track", "PageView");
    }
    loadScript("meta-pixel-script", "https://connect.facebook.net/en_US/fbevents.js");
  }
}

/** Sletter informasjonskapsler fra sporing på denne adressen og domenene over. */
function clearTrackingCookies() {
  const parts = window.location.hostname.split(".");
  const domains = [""];
  for (let index = 0; index < parts.length - 1; index += 1) {
    domains.push(`; domain=.${parts.slice(index).join(".")}`);
  }
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim() ?? "";
    if (isTrackingCookie(name)) {
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
      }
    }
  }
}

/**
 * Samtykkebanner og lasting av sporing på den publiserte prosjektsiden.
 * Banneret står først i dokumentet (etter hopp-lenken), så tastatur- og
 * skjermleserbrukere møter det tidlig, men vises nederst på skjermen.
 * «Bare nødvendige» er like enkelt som «Godta alle».
 */
export function ConsentManager({ tracking, cookiesHref }: { tracking: SiteTracking; cookiesHref: string }) {
  const t = useTranslations("site.consent");
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const raw = useSyncExternalStore(subscribe, readRaw, () => SERVER);
  const consent = useMemo(() => (raw === SERVER ? null : parseStoredConsent(raw)), [raw]);
  const [reopened, setReopened] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [draft, setDraft] = useState<ConsentChoice | null>(null);
  const inUse = categoriesInUse(tracking);
  const open = raw !== SERVER && (consent === null || reopened);
  const choices = draft ?? consent ?? { statistics: false, marketing: false };

  useEffect(() => {
    if (consent) {
      applyConsent(tracking, consent);
    }
  }, [tracking, consent]);

  useEffect(() => {
    function reopen() {
      setReopened(true);
      setCustomizing(true);
      setDraft(null);
      requestAnimationFrame(() => headingRef.current?.focus());
    }
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  // Konvertering når et interesseskjema er sendt, bare med samtykke.
  useEffect(() => {
    function onLead() {
      const allowed = scriptsAllowed(tracking, consent);
      if (allowed.ga4) {
        gtag("event", "generate_lead");
      }
      if (allowed.gtm) {
        window.dataLayer?.push({ event: "generate_lead" });
      }
      if (allowed.metaPixel) {
        window.fbq?.("track", "Lead");
      }
    }
    window.addEventListener(LEAD_SUBMITTED_EVENT, onLead);
    return () => window.removeEventListener(LEAD_SUBMITTED_EVENT, onLead);
  }, [tracking, consent]);

  const decide = useCallback(
    (choice: ConsentChoice) => {
      const next = { statistics: choice.statistics && inUse.statistics, marketing: choice.marketing && inUse.marketing };
      storeConsent(next);
      setReopened(false);
      setCustomizing(false);
      setDraft(null);
      if (consentWithdrawn(consent, next)) {
        // Skript som allerede kjører, kan ikke stoppes. Informasjonskapslene slettes,
        // og siden lastes på nytt uten sporingen.
        clearTrackingCookies();
        window.location.reload();
      }
    },
    [consent, inUse.marketing, inUse.statistics],
  );

  if (!open) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-[var(--site-background)] text-[var(--site-foreground)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
      style={{ borderColor: "color-mix(in srgb, var(--site-foreground) 15%, transparent)" }}
      data-testid="consent-banner"
    >
      <div className="mx-auto grid max-h-[70svh] w-full max-w-6xl gap-3 overflow-y-auto px-4 py-4 sm:px-6">
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className="site-heading text-lg font-semibold outline-none">
          {t("title")}
        </h2>
        <p className="max-w-3xl text-sm">
          {t("text")}{" "}
          <a href={cookiesHref} className="font-medium underline underline-offset-2">
            {t("readMore")}
          </a>
        </p>
        {customizing ? (
          <fieldset className="grid gap-2 text-sm">
            <legend className="mb-1 font-medium">{t("choose")}</legend>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-0.5 size-4" checked disabled />
              <span>
                <span className="font-medium">{t("necessary")}</span> – {t("necessaryHelp")}
              </span>
            </label>
            {inUse.statistics ? (
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4"
                  checked={choices.statistics}
                  onChange={(event) => setDraft({ ...choices, statistics: event.target.checked })}
                />
                <span>
                  <span className="font-medium">{t("statistics")}</span> – {t("statisticsHelp")}
                </span>
              </label>
            ) : null}
            {inUse.marketing ? (
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4"
                  checked={choices.marketing}
                  onChange={(event) => setDraft({ ...choices, marketing: event.target.checked })}
                />
                <span>
                  <span className="font-medium">{t("marketing")}</span> – {t("marketingHelp")}
                </span>
              </label>
            ) : null}
          </fieldset>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => decide({ statistics: true, marketing: true })}
            className="rounded-[var(--site-radius)] border-2 border-[var(--site-primary)] bg-[var(--site-primary)] px-4 py-2 font-medium text-[var(--site-primary-foreground)]"
          >
            {t("acceptAll")}
          </button>
          <button
            type="button"
            onClick={() => decide({ statistics: false, marketing: false })}
            className="rounded-[var(--site-radius)] border-2 border-[var(--site-primary)] bg-[var(--site-primary)] px-4 py-2 font-medium text-[var(--site-primary-foreground)]"
          >
            {t("necessaryOnly")}
          </button>
          {customizing ? (
            <button
              type="button"
              onClick={() => decide(choices)}
              className="rounded-[var(--site-radius)] border-2 border-current px-4 py-2 font-medium"
            >
              {t("save")}
            </button>
          ) : (
            <button type="button" onClick={() => setCustomizing(true)} className="rounded-[var(--site-radius)] border-2 border-current px-4 py-2 font-medium">
              {t("customize")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/** «Endre samtykke»: åpner banneret igjen. */
export function ConsentSettingsButton({ className }: { className?: string }) {
  const t = useTranslations("site.consent");
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      {t("change")}
    </button>
  );
}
