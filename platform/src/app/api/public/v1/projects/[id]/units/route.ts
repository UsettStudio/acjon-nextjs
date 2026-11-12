import * as Sentry from "@sentry/nextjs";

import { UUID_PATTERN, publicError, publicJson, publicPreflight } from "@/lib/api/public";
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
  const { data, error } = await supabase.rpc("get_public_units", { p_project_id: id });
  if (error) {
    Sentry.captureException(error);
    return publicError(500, "server_error", "Noe gikk galt. Prøv igjen.");
  }
  return data ? publicJson(data) : publicError(404, "not_found", "Fant ikke noe publisert prosjekt med denne id-en.");
}

export function OPTIONS() {
  return publicPreflight();
}
