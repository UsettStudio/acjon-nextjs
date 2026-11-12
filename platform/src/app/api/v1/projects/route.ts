import { apiErrorFromDatabase, apiJson, keyHashFrom, unauthorized } from "@/lib/api/keyed";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET /api/v1/projects: alle prosjekter i nøkkelens organisasjon, med antall enheter per status. Krever projects:read. */
export async function GET(request: Request) {
  const keyHash = keyHashFrom(request);
  if (!keyHash) {
    return unauthorized();
  }
  const { data, error } = await createAdminClient().rpc("api_projects", { p_key_hash: keyHash });
  return error ? apiErrorFromDatabase(error) : apiJson(data);
}
