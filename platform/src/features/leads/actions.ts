"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { leadUpdateSchema } from "@/features/leads/schemas";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { parseInput, postgresErrorCode, requireOrgCapability, runAction } from "@/lib/actions/server";
import { createClient } from "@/lib/supabase/server";

const uuid = z.uuid();

/** Status og internt notat. Meglere, administratorer og eiere i prosjektet (RLS). */
export async function updateLead(
  organizationId: string,
  leadId: string,
  input: z.input<typeof leadUpdateSchema>,
): Promise<ActionResult<{ updatedAt: string }>> {
  return runAction(async () => {
    if (!uuid.safeParse(organizationId).success || !uuid.safeParse(leadId).success) {
      return fail("invalidInput");
    }
    await requireOrgCapability(organizationId, "leads.read");
    const parsed = parseInput(leadUpdateSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leads")
      .update({ status: parsed.data.status, internal_note: parsed.data.internalNote })
      .eq("id", leadId)
      .eq("organization_id", organizationId)
      .select("updated_at")
      .maybeSingle();
    if (error) {
      if (postgresErrorCode(error) === "42501") {
        return fail("forbidden");
      }
      throw error;
    }
    if (!data) {
      return fail("notFound");
    }
    return ok({ updatedAt: data.updated_at });
  });
}

/** Sletter én henvendelse for godt. Bare eier og administrator. Slettingen logges uten personopplysninger. */
export async function deleteLead(organizationId: string, leadId: string): Promise<ActionResult> {
  return runAction(async () => {
    if (!uuid.safeParse(organizationId).success || !uuid.safeParse(leadId).success) {
      return fail("invalidInput");
    }
    await requireOrgCapability(organizationId, "leads.delete");
    const supabase = await createClient();
    const { error, count } = await supabase.from("leads").delete({ count: "exact" }).eq("id", leadId).eq("organization_id", organizationId);
    if (error) {
      throw error;
    }
    if (count === 0) {
      return fail("notFound");
    }
    revalidatePath("/[org]/leads", "layout");
    return ok();
  });
}

/**
 * Sletter alle henvendelser fra én e-postadresse i organisasjonen, for eksempel
 * når noen ber om å bli slettet (GDPR). Bare eier og administrator.
 */
export async function deleteLeadsByEmail(organizationId: string, email: string): Promise<ActionResult<{ deleted: number }>> {
  return runAction(async () => {
    const address = z.email().safeParse(email.trim());
    if (!uuid.safeParse(organizationId).success || !address.success) {
      return fail("invalidInput");
    }
    await requireOrgCapability(organizationId, "leads.delete");
    const supabase = await createClient();
    const { error, count } = await supabase
      .from("leads")
      .delete({ count: "exact" })
      .eq("organization_id", organizationId)
      .ilike("email", address.data.replace(/[%_\\]/g, (match) => `\\${match}`));
    if (error) {
      throw error;
    }
    revalidatePath("/[org]/leads", "layout");
    return ok({ deleted: count ?? 0 });
  });
}
