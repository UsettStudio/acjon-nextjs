"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { fail, ok, type ActionResult } from "@/lib/actions/result";
import {
  postgresErrorCode,
  parseInput,
  requireActionUser,
  requireOrgCapability,
  runAction,
} from "@/lib/actions/server";
import { createClient } from "@/lib/supabase/server";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
} from "@/features/organizations/schemas";

export async function createOrganization(input: CreateOrganizationInput): Promise<ActionResult> {
  return runAction(async () => {
    await requireActionUser();
    const parsed = parseInput(createOrganizationSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc("create_organization", {
      p_name: parsed.data.name,
      p_slug: parsed.data.slug,
    });
    if (error) {
      switch (postgresErrorCode(error)) {
        case "23505":
          return fail("invalidInput", { slug: "slugTaken" });
        case "23514":
          return fail("invalidInput", { slug: "slugReserved" });
        case "42501":
          return fail("unauthenticated");
        default:
          throw error;
      }
    }
    redirect(`/${parsed.data.slug}`);
  });
}

export async function updateOrganization(
  organizationId: string,
  currentSlug: string,
  input: UpdateOrganizationInput,
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(organizationId, "organization.update");
    const parsed = parseInput(updateOrganizationSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("organizations")
      .update({
        name: parsed.data.name,
        slug: parsed.data.slug,
        lead_retention_days: parsed.data.leadRetentionDays,
      })
      .eq("id", organizationId)
      .select("slug");
    if (error) {
      switch (postgresErrorCode(error)) {
        case "23505":
          return fail("invalidInput", { slug: "slugTaken" });
        case "23514":
          return fail("invalidInput", { slug: "slugReserved" });
        default:
          throw error;
      }
    }
    if (data.length === 0) {
      return fail("forbidden");
    }
    if (parsed.data.slug !== currentSlug) {
      redirect(`/${parsed.data.slug}/settings`);
    }
    refresh();
    return ok();
  });
}
