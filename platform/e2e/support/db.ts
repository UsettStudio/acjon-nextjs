import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

/**
 * Oppsett i testene som ikke kan gjøres i grensesnittet, for eksempel å la en
 * prøveperiode gå ut. Bruker service-nøkkelen fra .env.local (lokal Supabase),
 * og kjører bare i testprosessen, aldri i appen.
 */
function env(name: string): string {
  if (process.env[name]) {
    return process.env[name] as string;
  }
  const file = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  const line = file.split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`));
  const value = line?.slice(name.length + 1).trim().replace(/^"|"$/g, "");
  if (!value) {
    throw new Error(`${name} mangler i .env.local`);
  }
  return value;
}

export function serviceClient() {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Id-en til organisasjonen med adressen (slug). */
export async function organizationId(slug: string): Promise<string> {
  const { data, error } = await serviceClient().from("organizations").select("id").eq("slug", slug).single();
  if (error) {
    throw error;
  }
  return data.id;
}
