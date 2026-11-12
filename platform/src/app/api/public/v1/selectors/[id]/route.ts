import * as Sentry from "@sentry/nextjs";

import { UUID_PATTERN, publicError, publicJson, publicPreflight } from "@/lib/api/public";
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
  const { data, error } = await supabase.rpc("get_published_selector", { p_selector_id: id });
  if (error) {
    Sentry.captureException(error);
    return publicError(500, "server_error", "Noe gikk galt. Prøv igjen.");
  }
  return data ? publicJson(data) : publicError(404, "not_found", "Fant ingen publisert boligvelger med denne id-en.");
}

export function OPTIONS() {
  return publicPreflight();
}
