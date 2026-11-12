/**
 * Leads som CSV. Samme format som enhetseksporten: semikolon, UTF-8 med BOM og
 * vern mot formler i Excel.
 */

import { csvText, toCsv } from "@/features/units/export";

export const LEAD_EXPORT_COLUMNS = [
  "created_at",
  "name",
  "email",
  "phone",
  "project",
  "unit",
  "status",
  "source",
  "message",
  "consent_contact",
  "consent_similar",
  "consent_version",
  "consented_at",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "internal_note",
] as const;

export type LeadExportColumn = (typeof LEAD_EXPORT_COLUMNS)[number];

export type LeadExportRow = {
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  projectName: string;
  unitNumber: string | null;
  status: string;
  source: string;
  message: string | null;
  consentContact: boolean;
  consentSimilar: boolean;
  consentVersion: string;
  consentedAt: string;
  utm: Record<string, string>;
  internalNote: string | null;
};

export type LeadExportLabels = {
  header: (column: LeadExportColumn) => string;
  status: (status: string) => string;
  source: (source: string) => string;
  dateTime: (iso: string) => string;
  yes: string;
  no: string;
};

export function buildLeadsCsv(leads: LeadExportRow[], labels: LeadExportLabels): string {
  const header = LEAD_EXPORT_COLUMNS.map((column) => labels.header(column));
  const rows = leads.map((lead) =>
    LEAD_EXPORT_COLUMNS.map((column): string => {
      switch (column) {
        case "created_at":
          return labels.dateTime(lead.createdAt);
        case "name":
          return csvText(lead.name);
        case "email":
          return csvText(lead.email);
        case "phone":
          return csvText(lead.phone);
        case "project":
          return csvText(lead.projectName);
        case "unit":
          return csvText(lead.unitNumber);
        case "status":
          return labels.status(lead.status);
        case "source":
          return labels.source(lead.source);
        case "message":
          return csvText(lead.message);
        case "consent_contact":
          return lead.consentContact ? labels.yes : labels.no;
        case "consent_similar":
          return lead.consentSimilar ? labels.yes : labels.no;
        case "consent_version":
          return csvText(lead.consentVersion);
        case "consented_at":
          return labels.dateTime(lead.consentedAt);
        case "utm_source":
        case "utm_medium":
        case "utm_campaign":
          return csvText(lead.utm[column] ?? null);
        case "internal_note":
          return csvText(lead.internalNote);
      }
    }),
  );
  return toCsv([header, ...rows]);
}
