import "server-only";

import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Supabase-klient med service-rollen. RLS gjelder ikke, så den brukes bare på
 * serveren, og bare der det er nødvendig: å legge inn leads etter Turnstile og
 * rate limit, og å vise utkastet bak en signert forhåndsvisningslenke.
 */
export function createAdminClient() {
  const secret = serverEnv().supabaseSecretKey;
  if (!secret) {
    throw new Error("SUPABASE_SECRET_KEY mangler. Den trengs for leads og delt forhåndsvisning.");
  }
  return createClient<Database>(publicEnv().supabaseUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
