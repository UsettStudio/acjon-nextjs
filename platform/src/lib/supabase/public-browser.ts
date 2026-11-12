"use client";

import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

let client: ReturnType<typeof createClient<Database>> | undefined;

/**
 * Supabase-klient uten innlogging i nettleseren, for publiserte sider:
 * offentlig sanntidskanal for status og oppslag i de offentlige funksjonene.
 * Den bruker aldri sesjonen til en innlogget bruker.
 */
export function getPublicBrowserClient() {
  if (!client) {
    const env = publicEnv();
    client = createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "boligvelger-offentlig" },
    });
  }
  return client;
}
