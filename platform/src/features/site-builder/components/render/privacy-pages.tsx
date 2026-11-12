"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { ConsentSettingsButton } from "@/features/site-builder/components/render/consent-manager";
import { SITE_COOKIES_PATH, SITE_PRIVACY_PATH, type SiteRenderData } from "@/features/site-builder/site";
import { categoriesInUse, hasTracking } from "@/features/site-builder/tracking";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-2">
      <h2 className="site-heading text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function controllerOf(data: SiteRenderData): { name: string; email: string | null } {
  const name = data.privacy.controller.trim() || data.organization.name;
  const email = data.privacy.email.trim() || data.project.contacts.find((contact) => contact.email)?.email || null;
  return { name, email };
}

function trackingTools(data: SiteRenderData): string[] {
  return [
    data.tracking.ga4 ? "Google Analytics" : null,
    data.tracking.gtm ? "Google Tag Manager" : null,
    data.tracking.metaPixel ? "Meta Pixel" : null,
  ].filter((tool): tool is string => tool !== null);
}

const buttonClass =
  "justify-self-start rounded-[var(--site-radius)] border-2 border-[var(--site-primary)] px-4 py-2 font-medium text-[var(--site-primary)]";

/** /personvern: generert fra prosjektet, organisasjonen og innstillingene for personvern. */
export function PrivacyPageContent({ data }: { data: SiteRenderData }) {
  const t = useTranslations("site.privacy");
  const { name, email } = controllerOf(data);
  const tools = trackingTools(data);
  const orgNumber = data.privacy.org_number.trim();
  return (
    <article className="mx-auto grid w-full max-w-3xl gap-8 px-4 py-12 sm:px-6">
      <header className="grid gap-3">
        <h1 className="site-heading text-3xl font-semibold sm:text-4xl">{t("title")}</h1>
        <p className="text-lg">{t("intro", { controller: name, project: data.project.name })}</p>
      </header>
      <Section title={t("controllerTitle")}>
        <p>
          {orgNumber ? t("controllerWithNumber", { controller: name, number: orgNumber }) : t("controller", { controller: name })}{" "}
          {email ? (
            <>
              {t("contactAt")}{" "}
              <a href={`mailto:${email}`} className="underline underline-offset-2">
                {email}
              </a>
              .
            </>
          ) : null}
        </p>
      </Section>
      <Section title={t("collectedTitle")}>
        <p>{t("collected", { project: data.project.name })}</p>
      </Section>
      <Section title={t("purposeTitle")}>
        <p>{t("purpose", { project: data.project.name })}</p>
      </Section>
      <Section title={t("retentionTitle")}>
        <p>
          {data.privacy.leadRetentionDays
            ? t("retentionDays", { days: data.privacy.leadRetentionDays })
            : t("retentionUntilDeleted")}
        </p>
      </Section>
      <Section title={t("processorsTitle")}>
        <p>{t("processors", { controller: name })}</p>
      </Section>
      <Section title={t("trackingTitle")}>
        <p>{tools.length > 0 ? t("tracking", { tools: tools.join(", ") }) : t("noTracking")}</p>
        {tools.length > 0 ? (
          <p>
            <a href={SITE_COOKIES_PATH} className="underline underline-offset-2">
              {t("cookiesLink")}
            </a>
          </p>
        ) : null}
      </Section>
      <Section title={t("rightsTitle")}>
        <p>{t("rights", { controller: name })}</p>
        <p>
          {t("complaint")}{" "}
          <a href="https://www.datatilsynet.no" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            {t("authority")}
          </a>
          .
        </p>
      </Section>
      {data.privacy.extra.trim() ? (
        <Section title={t("moreTitle")}>
          {data.privacy.extra
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
        </Section>
      ) : null}
      {hasTracking(data.tracking) ? <ConsentSettingsButton className={buttonClass} /> : null}
    </article>
  );
}

type CookieRow = { name: string; purpose: string; category: string; duration: string };

/** /informasjonskapsler: hva som lagres i nettleseren, gruppert etter samtykkekategori. */
export function CookiesPageContent({ data, turnstile }: { data: SiteRenderData; turnstile: boolean }) {
  const t = useTranslations("site.cookies");
  const inUse = categoriesInUse(data.tracking);
  const rows: CookieRow[] = [
    { name: "samtykke", purpose: t("consentPurpose"), category: t("necessary"), duration: t("twelveMonths") },
    { name: "boligvelger:favoritter:…", purpose: t("favoritesPurpose"), category: t("necessary"), duration: t("untilDeleted") },
  ];
  if (data.tracking.ga4) {
    rows.push({ name: "_ga, _ga_…", purpose: t("gaPurpose"), category: t("statistics"), duration: t("twoYears") });
  }
  if (data.tracking.gtm) {
    rows.push({ name: "Google Tag Manager", purpose: t("gtmPurpose"), category: t("statisticsAndMarketing"), duration: t("dependsOnTools") });
  }
  if (data.tracking.metaPixel) {
    rows.push({ name: "_fbp", purpose: t("pixelPurpose"), category: t("marketing"), duration: t("threeMonths") });
  }
  return (
    <article className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-12 sm:px-6">
      <header className="grid gap-3">
        <h1 className="site-heading text-3xl font-semibold sm:text-4xl">{t("title")}</h1>
        <p className="text-lg">{t("intro")}</p>
        <p>{inUse.statistics || inUse.marketing ? t("consentNeeded") : t("noConsentNeeded")}</p>
      </header>
      {/* Tabellen kan rulles sideveis på smale skjermer. Området kan få fokus, så den kan rulles med tastaturet. */}
      <div
        role="region"
        aria-labelledby="informasjonskapsler-tabell"
        tabIndex={0}
        className="overflow-x-auto rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--site-primary)]"
      >
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <caption id="informasjonskapsler-tabell" className="sr-only">
            {t("tableCaption")}
          </caption>
          <thead>
            <tr className="border-b-2" style={{ borderColor: "color-mix(in srgb, var(--site-foreground) 25%, transparent)" }}>
              <th scope="col" className="py-2 pr-4">{t("name")}</th>
              <th scope="col" className="py-2 pr-4">{t("purpose")}</th>
              <th scope="col" className="py-2 pr-4">{t("category")}</th>
              <th scope="col" className="py-2">{t("duration")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b align-top" style={{ borderColor: "color-mix(in srgb, var(--site-foreground) 12%, transparent)" }}>
                <th scope="row" className="py-2 pr-4 font-mono text-xs font-normal">{row.name}</th>
                <td className="py-2 pr-4">{row.purpose}</td>
                <td className="py-2 pr-4">{row.category}</td>
                <td className="py-2">{row.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {turnstile ? <p>{t("turnstile")}</p> : null}
      <p>
        <a href={SITE_PRIVACY_PATH} className="underline underline-offset-2">
          {t("privacyLink")}
        </a>
      </p>
      {hasTracking(data.tracking) ? <ConsentSettingsButton className={buttonClass} /> : null}
    </article>
  );
}
