/**
 * Samtykketekstene på interesseskjemaet. Hver lead lagrer versjonen den ble
 * sendt med (leads.consent_text_version), så det alltid kan vises nøyaktig
 * hvilken tekst avsenderen godtok. Endres teksten, må versjonen endres, og
 * den gamle teksten beholdes her.
 */

export type ConsentLocale = "nb" | "en" | "sv";

type ConsentText = { contact: string; similar: string };

export const CONSENT_VERSIONS: Record<string, Record<ConsentLocale, ConsentText>> = {
  "samtykke-2026-11-12": {
    nb: {
      contact:
        "Jeg samtykker til at {organization} lagrer opplysningene mine og kontakter meg om {project}. Jeg kan når som helst be om at opplysningene slettes.",
      similar: "Jeg vil også gjerne høre om lignende prosjekter fra {organization}.",
    },
    en: {
      contact:
        "I agree that {organization} may store my details and contact me about {project}. I can ask for my details to be deleted at any time.",
      similar: "I would also like to hear about similar projects from {organization}.",
    },
    sv: {
      contact:
        "Jag samtycker till att {organization} sparar mina uppgifter och kontaktar mig om {project}. Jag kan när som helst be att uppgifterna raderas.",
      similar: "Jag vill också gärna höra om liknande projekt från {organization}.",
    },
  },
};

export const CURRENT_CONSENT_VERSION = "samtykke-2026-11-12";

export function consentTexts(
  locale: string,
  values: { organization: string; project: string },
  version: string = CURRENT_CONSENT_VERSION,
): ConsentText {
  const texts = Object.hasOwn(CONSENT_VERSIONS, version) ? CONSENT_VERSIONS[version] : CONSENT_VERSIONS[CURRENT_CONSENT_VERSION];
  const localized = texts?.[(["nb", "en", "sv"].includes(locale) ? locale : "nb") as ConsentLocale] ?? texts?.nb;
  const fill = (text: string) => text.replaceAll("{organization}", values.organization).replaceAll("{project}", values.project);
  return { contact: fill(localized?.contact ?? ""), similar: fill(localized?.similar ?? "") };
}
