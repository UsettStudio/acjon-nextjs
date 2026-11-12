import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { connection } from "next/server";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Supabase-klient uten innlogging for publiserte sider. Bruker bare den
 * offentlige nøkkelen og leser bare gjennom de offentlige funksjonene i
 * databasen, som selv sørger for at bare publiserte data kommer ut.
 * Data leses per forespørsel, så status alltid er fersk.
 */
export async function createPublicClient() {
  await connection();
  const env = publicEnv();
  return createSupabaseClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
