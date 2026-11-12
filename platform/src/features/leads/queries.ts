import "server-only";

import { searchTerm, type LeadFilters, LEADS_PAGE_SIZE } from "@/features/leads/filters";
import type { LeadExportRow } from "@/features/leads/export";
import { recipientHost, type PersonDelivery, type PersonLead } from "@/features/leads/person-export";
import type { LeadStatus } from "@/features/leads/schemas";
import { createClient } from "@/lib/supabase/server";

export type LeadListItem = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  source: string;
  project: { id: string; name: string; slug: string } | null;
  unitNumber: string | null;
};

export type LeadDetail = LeadListItem & {
  message: string | null;
  internalNote: string | null;
  unit: { id: string; unitNumber: string; slug: string } | null;
  pageTitle: string | null;
  consentContact: boolean;
  consentSimilar: boolean;
  consentVersion: string;
  consentedAt: string;
  notifiedAt: string | null;
  utm: Record<string, string>;
  updatedAt: string;
  /** Andre henvendelser fra samme e-postadresse i organisasjonen. */
  sameEmailCount: number;
};

const LIST_COLUMNS =
  "id, created_at, name, email, phone, status, source, unit_number, project:projects!leads_project_id_organization_id_fkey(id, name, slug)" as const;

function stringRecord(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

/** Filtrene som gjelder både listen og eksporten. RLS begrenser til prosjektene brukeren ser leads i. */
function applyFilters<T extends { eq: (column: string, value: string) => T; or: (filter: string) => T }>(
  query: T,
  organizationId: string,
  filters: LeadFilters,
): T {
  let result = query.eq("organization_id", organizationId);
  if (filters.status) {
    result = result.eq("status", filters.status);
  }
  if (filters.projectId) {
    result = result.eq("project_id", filters.projectId);
  }
  if (filters.unitId) {
    result = result.eq("unit_id", filters.unitId);
  }
  const term = searchTerm(filters.search);
  if (term) {
    result = result.or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,unit_number.ilike.%${term}%`);
  }
  return result;
}

function toListItem(row: {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  source: string;
  unit_number: string | null;
  project: { id: string; name: string; slug: string } | null;
}): LeadListItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    source: row.source,
    project: row.project,
    unitNumber: row.unit_number,
  };
}

/** En side av leadslisten, nyeste først. */
export async function listLeads(organizationId: string, filters: LeadFilters): Promise<{ leads: LeadListItem[]; total: number }> {
  const supabase = await createClient();
  const from = (filters.page - 1) * LEADS_PAGE_SIZE;
  const { data, error, count } = await applyFilters(
    supabase.from("leads").select(LIST_COLUMNS, { count: "exact" }),
    organizationId,
    filters,
  )
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, from + LEADS_PAGE_SIZE - 1);
  if (error) {
    throw error;
  }
  return { leads: data.map(toListItem), total: count ?? data.length };
}

/** De siste henvendelsene i et prosjekt (prosjektoversikten). */
export async function listRecentLeads(organizationId: string, projectId: string, limit = 5): Promise<LeadListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LIST_COLUMNS)
    .eq("organization_id", organizationId)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    throw error;
  }
  return data.map(toListItem);
}

/** Alle leads som passer filtrene, til eksport (høyst 10 000). */
export async function listLeadsForExport(organizationId: string, filters: LeadFilters): Promise<LeadExportRow[]> {
  const supabase = await createClient();
  const { data, error } = await applyFilters(
    supabase
      .from("leads")
      .select(
        "created_at, name, email, phone, status, source, message, unit_number, consent_contact, consent_similar_projects, consent_text_version, consented_at, utm, internal_note, project:projects!leads_project_id_organization_id_fkey(name)",
      ),
    organizationId,
    filters,
  )
    .order("created_at", { ascending: false })
    .limit(10000);
  if (error) {
    throw error;
  }
  return data.map((row) => ({
    createdAt: row.created_at,
    name: row.name,
    email: row.email,
    phone: row.phone,
    projectName: row.project?.name ?? "",
    unitNumber: row.unit_number,
    status: row.status,
    source: row.source,
    message: row.message,
    consentContact: row.consent_contact,
    consentSimilar: row.consent_similar_projects,
    consentVersion: row.consent_text_version,
    consentedAt: row.consented_at,
    utm: stringRecord(row.utm),
    internalNote: row.internal_note,
  }));
}

/** Én henvendelse med alt som er lagret om den. */
export async function getLead(organizationId: string, leadId: string): Promise<LeadDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(leadId)) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      `${LIST_COLUMNS}, message, internal_note, consent_contact, consent_similar_projects, consent_text_version, consented_at, notified_at, utm, updated_at, unit:units!leads_unit_id_project_id_organization_id_fkey(id, unit_number, slug), page:pages!leads_page_id_project_id_organization_id_fkey(title)`,
    )
    .eq("organization_id", organizationId)
    .eq("id", leadId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .ilike("email", data.email.replace(/[%_\\]/g, (match) => `\\${match}`))
    .neq("id", data.id);
  return {
    ...toListItem(data),
    message: data.message,
    internalNote: data.internal_note,
    unit: data.unit ? { id: data.unit.id, unitNumber: data.unit.unit_number, slug: data.unit.slug } : null,
    pageTitle: data.page?.title ?? null,
    consentContact: data.consent_contact,
    consentSimilar: data.consent_similar_projects,
    consentVersion: data.consent_text_version,
    consentedAt: data.consented_at,
    notifiedAt: data.notified_at,
    utm: stringRecord(data.utm),
    updatedAt: data.updated_at,
    sameEmailCount: count ?? 0,
  };
}


/** Prosjektene i organisasjonen brukeren ser, til prosjektfilteret. */
export async function listLeadProjects(organizationId: string): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("id, name").eq("organization_id", organizationId).order("name");
  if (error) {
    throw error;
  }
  return data;
}

/** Enhetene i et prosjekt, til enhetsfilteret. */
export async function listLeadUnits(projectId: string): Promise<{ id: string; unitNumber: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("units").select("id, unit_number").eq("project_id", projectId).order("sort_order").order("unit_number");
  if (error) {
    throw error;
  }
  return data.map((unit) => ({ id: unit.id, unitNumber: unit.unit_number }));
}

/** Organisasjonens språk, som interesseskjemaet ble vist på. */
export async function getOrganizationLocale(organizationId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from("organizations").select("locale").eq("id", organizationId).maybeSingle();
  return data?.locale ?? "nb";
}

const escapeLike = (value: string) => value.replace(/[%_\\]/g, (match) => `\\${match}`);

/** Alle henvendelser fra én e-postadresse i organisasjonen, eldste først (innsyn). */
export async function listPersonLeads(organizationId: string, email: string): Promise<PersonLead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, created_at, name, email, phone, message, status, source, unit_number, consent_contact, consent_similar_projects, consent_text_version, consented_at, utm, internal_note, project:projects!leads_project_id_organization_id_fkey(name), page:pages!leads_page_id_project_id_organization_id_fkey(title)",
    )
    .eq("organization_id", organizationId)
    .ilike("email", escapeLike(email))
    .order("created_at");
  if (error) {
    throw error;
  }
  return data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    projectName: row.project?.name ?? "",
    unitNumber: row.unit_number,
    pageTitle: row.page?.title ?? null,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
    source: row.source,
    utm: stringRecord(row.utm),
    consentContact: row.consent_contact,
    consentSimilar: row.consent_similar_projects,
    consentVersion: row.consent_text_version,
    consentedAt: row.consented_at,
    internalNote: row.internal_note,
  }));
}

/** Kopier av henvendelsene som er sendt med webhooks (loggen har de siste 30 dagene). */
export async function listPersonDeliveries(organizationId: string, email: string): Promise<PersonDelivery[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("webhook_deliveries")
    .select("created_at, delivered_at, status, webhook:webhooks(url)")
    .eq("organization_id", organizationId)
    .eq("event", "lead.created")
    .eq("is_test", false)
    .ilike("payload->data->>email", escapeLike(email))
    .order("created_at");
  if (error) {
    throw error;
  }
  return data.map((row) => ({
    createdAt: row.created_at,
    deliveredAt: row.delivered_at,
    status: row.status,
    recipient: row.webhook ? recipientHost(row.webhook.url) : "",
  }));
}
