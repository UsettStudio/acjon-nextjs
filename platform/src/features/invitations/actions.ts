"use server";

import { redirect } from "next/navigation";

import { fail, type ActionResult } from "@/lib/actions/result";
import { postgresErrorCode, requireActionUser, runAction } from "@/lib/actions/server";
import { createClient } from "@/lib/supabase/server";

export async function acceptInvitation(
  token: string,
): Promise<ActionResult<undefined, "invalidInvitation" | "wrongAccount">> {
  return runAction(async () => {
    await requireActionUser();
    const supabase = await createClient();
    const { data: organizationId, error } = await supabase.rpc("accept_invitation", { p_token: token });
    if (error) {
      switch (postgresErrorCode(error)) {
        case "P0002":
          return fail("invalidInvitation");
        case "42501":
          return fail("wrongAccount");
        default:
          throw error;
      }
    }
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("slug")
      .eq("id", organizationId)
      .single();
    if (orgError) {
      throw orgError;
    }
    redirect(`/${organization.slug}`);
  });
}
