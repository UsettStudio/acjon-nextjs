/**
 * Innsyn (GDPR artikkel 15): alt som er lagret om én person i organisasjonen,
 * som JSON. Med i eksporten er henvendelsene med internt notat, samtykket med
 * den eksakte teksten personen godtok, og hvilke systemer kopier er sendt til
 * med webhooks (loggen har de siste 30 dagene).
 */

import { CONSENT_VERSIONS, consentTexts } from "@/features/leads/consent";

export const PERSON_EXPORT_FORMAT = "innsyn-1";

export type PersonLead = {
  id: string;
  createdAt: string;
  projectName: string;
  unitNumber: string | null;
  pageTitle: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  source: string;
  utm: Record<string, string>;
  consentContact: boolean;
  consentSimilar: boolean;
  consentVersion: string;
  consentedAt: string;
  internalNote: string | null;
};

export type PersonDelivery = {
  createdAt: string;
  deliveredAt: string | null;
  status: string;
  /** Vertsnavnet webhooken sendte til. */
  recipient: string;
};

export function buildPersonExport(input: {
  email: string;
  organizationName: string;
  locale: string;
  generatedAt: string;
  leads: PersonLead[];
  deliveries: PersonDelivery[];
}) {
  return {
    format: PERSON_EXPORT_FORMAT,
    generated_at: input.generatedAt,
    controller: input.organizationName,
    person: { email: input.email },
    leads: input.leads.map((lead) => ({
      id: lead.id,
      created_at: lead.createdAt,
      project: lead.projectName,
      unit: lead.unitNumber,
      page: lead.pageTitle,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      status: lead.status,
      source: lead.source,
      utm: lead.utm,
      internal_note: lead.internalNote,
      consent: {
        contact: lead.consentContact,
        similar_projects: lead.consentSimilar,
        given_at: lead.consentedAt,
        text_version: lead.consentVersion,
        // Teksten slik den ble vist. Ukjente versjoner får ingen tekst, i stedet for en annen versjon.
        texts: Object.hasOwn(CONSENT_VERSIONS, lead.consentVersion)
          ? consentTexts(input.locale, { organization: input.organizationName, project: lead.projectName }, lead.consentVersion)
          : null,
      },
    })),
    webhook_deliveries: input.deliveries.map((delivery) => ({
      created_at: delivery.createdAt,
      delivered_at: delivery.deliveredAt,
      status: delivery.status,
      recipient: delivery.recipient,
    })),
  };
}

/** Vertsnavnet i en adresse, eller hele adressen hvis den ikke kan leses. */
export function recipientHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
