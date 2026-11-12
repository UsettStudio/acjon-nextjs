import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

import { HtmlLang } from "@/features/site-builder/components/html-lang";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

type Messages = Record<string, unknown>;

async function loadMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case "en":
      return (await import("../../../../messages/en.json")).default;
    case "sv":
      return (await import("../../../../messages/sv.json")).default;
    default:
      return (await import("../../../../messages/nb.json")).default;
  }
}

/** Bare tekstene prosjektsiden bruker, så siden ikke laster all tekst fra admin. */
function pickSiteMessages(messages: Messages): Messages {
  const units = (messages.units ?? {}) as Messages;
  return {
    site: messages.site,
    publicSelector: messages.publicSelector,
    unitStatus: messages.unitStatus,
    validation: messages.validation,
    common: messages.common,
    units: { fields: units.fields, types: units.types, ownership: units.ownership },
  };
}

/** Tekst på organisasjonens språk for alt under en publisert prosjektside. */
export async function SiteIntlProvider({ locale, children }: { locale: string; children: ReactNode }) {
  const safe = isLocale(locale) ? locale : defaultLocale;
  const messages = pickSiteMessages(await loadMessages(safe));
  return (
    <NextIntlClientProvider locale={safe} messages={messages} timeZone="Europe/Oslo">
      <HtmlLang lang={safe} />
      {children}
    </NextIntlClientProvider>
  );
}
