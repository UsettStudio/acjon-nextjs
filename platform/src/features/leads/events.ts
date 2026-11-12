/**
 * Hendelse i nettleseren når et interesseskjema er sendt. Brukes av sporingen
 * (konvertering etter samtykke) og av innbyggingen (web-komponenten får
 * beskjed). Inneholder aldri personopplysninger.
 */
export const LEAD_SUBMITTED_EVENT = "lead:submitted";

export type LeadSubmittedDetail = {
  projectId: string;
  unitId: string | null;
  source: string;
};

export function announceLeadSubmitted(detail: LeadSubmittedDetail): void {
  window.dispatchEvent(new CustomEvent<LeadSubmittedDetail>(LEAD_SUBMITTED_EVENT, { detail }));
}
