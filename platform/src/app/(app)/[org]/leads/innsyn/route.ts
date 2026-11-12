import { z } from "zod";

import { buildPersonExport } from "@/features/leads/person-export";
import { getOrganizationLocale, listPersonDeliveries, listPersonLeads } from "@/features/leads/queries";
import { getCurrentUser, getMemberships } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

/**
 * Innsyn (GDPR): alt som er lagret om én person i organisasjonen, som JSON-fil.
 * Samme tilgang som sletting av personopplysninger (eier og administrator), også i
 * lesemodus. Uthentingen logges med antall henvendelser, ikke hvem det gjaldt.
 */
export async function GET(request: Request, { params }: RouteContext<"/[org]/leads/innsyn">) {
  const { org } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return new Response(null, { status: 401 });
  }
  const membership = (await getMemberships()).find((m) => m.organization.slug === org);
  if (!membership || !can(membership.role, "leads.delete")) {
    return new Response(null, { status: 404 });
  }
  const email = z.email().safeParse(new URL(request.url).searchParams.get("email")?.trim() ?? "");
  if (!email.success) {
    return new Response(null, { status: 400 });
  }
  const organizationId = membership.organization.id;
  const [leads, deliveries, locale] = await Promise.all([
    listPersonLeads(organizationId, email.data),
    listPersonDeliveries(organizationId, email.data),
    getOrganizationLocale(organizationId),
  ]);
  const supabase = await createClient();
  const { error } = await supabase.rpc("log_person_export", { p_organization_id: organizationId, p_leads: leads.length });
  if (error) {
    throw error;
  }
  const generatedAt = new Date().toISOString();
  const body = buildPersonExport({
    email: email.data.toLowerCase(),
    organizationName: membership.organization.name,
    locale,
    generatedAt,
    leads,
    deliveries,
  });
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date(generatedAt));
  return new Response(`${JSON.stringify(body, null, 2)}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="innsyn-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
