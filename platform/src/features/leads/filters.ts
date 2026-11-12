/**
 * Filtrene i leadslisten. De ligger i adressen (?status=new&q=…), så en filtrert
 * liste kan deles, og eksporten bruker nøyaktig de samme filtrene.
 */

import { LEAD_STATUSES, type LeadStatus } from "@/features/leads/schemas";

export const LEADS_PAGE_SIZE = 50;

export type LeadFilters = {
  status: LeadStatus | null;
  projectId: string | null;
  unitId: string | null;
  search: string;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseLeadFilters(params: SearchParams | URLSearchParams): LeadFilters {
  const get = (key: string) => (params instanceof URLSearchParams ? (params.get(key) ?? "") : first(params[key]));
  const status = get("status");
  const project = get("project");
  const unit = get("unit");
  const page = Number.parseInt(get("page"), 10);
  return {
    status: (LEAD_STATUSES as readonly string[]).includes(status) ? (status as LeadStatus) : null,
    projectId: UUID.test(project) ? project : null,
    unitId: UUID.test(unit) ? unit : null,
    search: get("q").trim().slice(0, 100),
    page: Number.isFinite(page) && page > 1 ? Math.min(page, 1000) : 1,
  };
}

/** Filtrene som adresse-parametre. Tomme filtre utelates. */
export function leadFilterParams(filters: Partial<LeadFilters>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.projectId) {
    params.set("project", filters.projectId);
  }
  if (filters.unitId) {
    params.set("unit", filters.unitId);
  }
  if (filters.search) {
    params.set("q", filters.search);
  }
  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }
  return params;
}

/**
 * Søketeksten slik den kan brukes i et PostgREST-filter. Tegn som har egen
 * betydning i filteret (komma, parenteser, jokertegn), fjernes.
 */
export function searchTerm(value: string): string {
  return value.replace(/[,()*%_\\:"']/g, " ").replace(/\s+/g, " ").trim();
}
