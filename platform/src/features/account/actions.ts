"use server";

import { refresh } from "next/cache";

import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { parseInput, requireActionUser, runAction } from "@/lib/actions/server";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileInput } from "@/features/account/schemas";

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireActionUser();
    const parsed = parseInput(profileSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: parsed.data.fullName, phone: parsed.data.phone || null })
      .eq("id", user.id);
    if (error) {
      throw error;
    }
    refresh();
    return ok();
  });
}
