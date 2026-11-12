import * as Sentry from "@sentry/nextjs";

import { UUID_PATTERN, publicError, publicJson, publicPlanRequired, publicPreflight } from "@/lib/api/public";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * GET /api/public/v1/projects/{id}/units: synlige enheter i et prosjekt med
 * publisert prosjektside eller boligvelger, med status og pris slik kjøpere ser dem.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/public/v1/projects/[id]/units">) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return publicError(400, "invalid_id", "Id-en må være en UUID.");
  }
  const supabase = await createPublicClient();
  const [{ data, error }, allowed] = await Promise.all([
    supabase.rpc("get_public_units", { p_project_id: id }),
    supabase.rpc("integration_allowed", { p_feature: "api", p_project_id: id }),
  ]);
  if (error || allowed.error) {
    Sentry.captureException(error ?? allowed.error);
    return publicError(500, "server_error", "Noe gikk galt. Prøv igjen.");
  }
  if (!data) {
    return publicError(404, "not_found", "Fant ikke noe publisert prosjekt med denne id-en.");
  }
  return allowed.data ? publicJson(data) : publicPlanRequired();
}

export function OPTIONS() {
  return publicPreflight();
}
