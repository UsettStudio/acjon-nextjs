import { connection } from "next/server";

import { publicEnv } from "@/lib/env";

const CHECKS = { database: "/rest/v1/", auth: "/auth/v1/health", storage: "/storage/v1/status" } as const;

/**
 * Helsesjekk for overvåking av oppetid (se docs/drift.md): 200 når appen og
 * Supabase (database via REST, innlogging og lagring) svarer, ellers 503. Svaret
 * sier bare hvilke deler som svarer, ingenting om data eller oppsett.
 */
export async function GET() {
  await connection();
  const env = publicEnv();
  const results = await Promise.all(
    Object.entries(CHECKS).map(async ([name, path]) => {
      try {
        const response = await fetch(`${env.supabaseUrl}${path}`, {
          headers: { apikey: env.supabasePublishableKey },
          cache: "no-store",
          signal: AbortSignal.timeout(3000),
        });
        return [name, response.ok] as const;
      } catch {
        return [name, false] as const;
      }
    }),
  );
  const checks = Object.fromEntries(results);
  const ok = results.every(([, healthy]) => healthy);
  return Response.json({ ok, checks }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
