import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Primærdomenet til prosjektsiden bak et underdomene eller eget domene. Proxyen
 * sender besøkende videre dit (308), så siden har én adresse for søkemotorer
 * og deling. Svaret huskes i ett minutt per serverinstans; et nytt
 * primærdomene tar derfor inntil ett minutt å slå inn.
 */

const TTL_MS = 60_000;
const MAX_ENTRIES = 2000;
const cache = new Map<string, { primary: string | null; expires: number }>();

let client: ReturnType<typeof createClient<Database>> | undefined;

function anonClient() {
  const env = publicEnv();
  client ??= createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

async function lookup(key: string): Promise<string | null> {
  const isHostname = key.includes(".");
  const { data, error } = await anonClient().rpc(
    "resolve_site",
    isHostname ? { p_hostname: key } : { p_subdomain: key },
  );
  if (error) {
    throw error;
  }
  const site = (data as { site?: { primary_hostname?: unknown } } | null)?.site;
  return typeof site?.primary_hostname === "string" ? site.primary_hostname : null;
}

export async function primaryHostFor(key: string, now = Date.now()): Promise<string | null> {
  const normalized = key.toLowerCase();
  const hit = cache.get(normalized);
  if (hit && hit.expires > now) {
    return hit.primary;
  }
  const primary = await lookup(normalized);
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  cache.set(normalized, { primary, expires: now + TTL_MS });
  return primary;
}

/** Adressen besøkende skal sendes til, eller null når de allerede er på primærdomenet. */
export function primaryRedirect(key: string, primary: string | null, pathname: string, search: string): URL | null {
  if (!primary || primary === key.toLowerCase()) {
    return null;
  }
  return new URL(`${pathname}${search}`, `https://${primary}`);
}
