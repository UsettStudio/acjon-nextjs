"use client";

import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Supabase-klient i nettleseren, med innlogget brukers sesjon fra cookies.
 * Brukes til opplasting rett til Storage og til sanntid. RLS gjelder som ellers.
 */
export function getBrowserClient() {
  if (!client) {
    const env = publicEnv();
    client = createBrowserClient<Database>(env.supabaseUrl, env.supabasePublishableKey);
  }
  return client;
}
