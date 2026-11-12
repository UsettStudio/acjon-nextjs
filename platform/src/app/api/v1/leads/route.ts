import type { NextRequest } from "next/server";

import { UUID, apiError, apiErrorFromDatabase, apiJson, keyHashFrom, timestampParam, unauthorized } from "@/lib/api/keyed";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/v1/leads: leads i nøkkelens organisasjon, eldste først. Filtrer med
 * «project_id», og hent nye med «since» satt til created_at for det siste du
 * har fått. «limit» er 1–500 (standard 100). Internt notat er ikke med.
 * Krever leads:read.
 */
export async function GET(request: NextRequest) {
  const keyHash = keyHashFrom(request);
  if (!keyHash) {
    return unauthorized();
  }
  const query = request.nextUrl.searchParams;
  const projectId = query.get("project_id");
  const since = timestampParam(query.get("since"));
  const limit = query.get("limit") === null ? 100 : Number(query.get("limit"));
  if ((projectId !== null && !UUID.test(projectId)) || since === undefined || !Number.isInteger(limit) || limit < 1 || limit > 500) {
    return apiError(400, "invalid_request", "Ugyldig project_id, since eller limit.");
  }
  const { data, error } = await createAdminClient().rpc("api_leads", {
    p_key_hash: keyHash,
    p_project_id: projectId ?? undefined,
    p_since: since ?? undefined,
    p_limit: limit,
  });
  return error ? apiErrorFromDatabase(error) : apiJson(data);
}
