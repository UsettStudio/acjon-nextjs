import "server-only";

import * as Sentry from "@sentry/nextjs";

import type { ServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Logger påloggingen i revisjonsloggen for alle organisasjonene brukeren er med i.
 * En feil her skal ikke stoppe innloggingen, men den rapporteres.
 */
export async function recordLogin(supabase: ServerSupabaseClient): Promise<void> {
  const { error } = await supabase.rpc("record_login");
  if (error) {
    console.error("Kunne ikke logge pålogging", error);
    Sentry.captureException(error);
  }
}
