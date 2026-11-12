"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

let client: Promise<SupabaseClient<Database>> | undefined;

/**
 * Supabase-klient uten innlogging i nettleseren, for publiserte sider:
 * offentlig sanntidskanal for status og oppslag i de offentlige funksjonene.
 * Den bruker aldri sesjonen til en innlogget bruker.
 *
 * Biblioteket lastes først når klienten trengs, etter at siden er vist. Da
 * forsinker det ikke første visning av prosjektsiden (LCP på mobil).
 */
export function loadPublicBrowserClient(): Promise<SupabaseClient<Database>> {
  client ??= import("@supabase/supabase-js").then(({ createClient }) => {
    const env = publicEnv();
    return createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "boligvelger-offentlig" },
    });
  });
  return client;
}
