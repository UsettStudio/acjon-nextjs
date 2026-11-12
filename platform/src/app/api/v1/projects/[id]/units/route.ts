import type { NextRequest } from "next/server";

import { UUID, apiError, apiErrorFromDatabase, apiJson, keyHashFrom, timestampParam, unauthorized } from "@/lib/api/keyed";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/v1/projects/{id}/units: alle enheter i prosjektet, også skjulte, med
 * ekstern id, kilde og egne felt. «updated_since» (ISO 8601) gir bare enheter
 * som er endret etter tidspunktet. Krever units:read.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/v1/projects/[id]/units">) {
  const keyHash = keyHashFrom(request);
  if (!keyHash) {
    return unauthorized();
  }
  const { id } = await params;
  const since = timestampParam(request.nextUrl.searchParams.get("updated_since"));
  if (!UUID.test(id) || since === undefined) {
    return apiError(400, "invalid_request", "Ugyldig prosjekt-id eller updated_since.");
  }
  const { data, error } = await createAdminClient().rpc("api_units", {
    p_key_hash: keyHash,
    p_project_id: id,
    p_updated_since: since ?? undefined,
  });
  return error ? apiErrorFromDatabase(error) : apiJson(data);
}
