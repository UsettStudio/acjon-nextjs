"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { ActionError, postgresErrorCode, requireActionUser, runAction } from "@/lib/actions/server";
import { createClient } from "@/lib/supabase/server";

const extendTrialSchema = z.object({ organizationId: z.uuid(), days: z.number().int().min(1).max(90) });

/**
 * Support: forlenger prøveperioden for en organisasjon uten abonnement i
 * Stripe. Databasen sjekker at brukeren er plattformadmin og logger endringen.
 */
export async function extendTrial(input: { organizationId: string; days: number }): Promise<ActionResult<{ trialEndsAt: string }>> {
  return runAction(async () => {
    await requireActionUser();
    const parsed = extendTrialSchema.safeParse(input);
    if (!parsed.success) {
      throw new ActionError("invalidInput");
    }
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("extend_trial", {
      p_organization_id: parsed.data.organizationId,
      p_days: parsed.data.days,
    });
    if (error) {
      switch (postgresErrorCode(error)) {
        case "42501":
          return fail("forbidden");
        case "22023":
        case "P0002":
          return fail("invalidInput");
        default:
          throw error;
      }
    }
    refresh();
    return ok({ trialEndsAt: data });
  });
}
