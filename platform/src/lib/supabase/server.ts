import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Supabase-klient for Server Components, Server Actions og Route Handlers.
 * Kjører med innlogget brukers rettigheter, så RLS gjelder for alt den gjør.
 * Lag en ny klient per forespørsel.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const env = publicEnv();

  return createServerClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Kalt fra en Server Component, der cookies ikke kan skrives.
          // proxy.ts fornyer sesjonen på hver forespørsel, så dette er trygt å ignorere.
        }
      },
    },
  });
}

export type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;
