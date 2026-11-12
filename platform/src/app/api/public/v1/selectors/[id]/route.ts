import * as Sentry from "@sentry/nextjs";

import { UUID_PATTERN, publicError, publicJson, publicPlanRequired, publicPreflight } from "@/lib/api/public";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * GET /api/public/v1/selectors/{id}: en publisert boligvelger med visninger,
 * markeringer, enheter med status og statusfarger. Bare det kjøpere ser.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/public/v1/selectors/[id]">) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return publicError(400, "invalid_id", "Id-en må være en UUID.");
  }
  const supabase = await createPublicClient();
  const [{ data, error }, allowed] = await Promise.all([
    supabase.rpc("get_published_selector", { p_selector_id: id }),
    supabase.rpc("integration_allowed", { p_feature: "api", p_selector_id: id }),
  ]);
  if (error || allowed.error) {
    Sentry.captureException(error ?? allowed.error);
    return publicError(500, "server_error", "Noe gikk galt. Prøv igjen.");
  }
  if (!data) {
    return publicError(404, "not_found", "Fant ingen publisert boligvelger med denne id-en.");
  }
  return allowed.data ? publicJson(data) : publicPlanRequired();
}

export function OPTIONS() {
  return publicPreflight();
}
