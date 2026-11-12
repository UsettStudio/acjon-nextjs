import * as Sentry from "@sentry/nextjs";

import { UUID_PATTERN, publicError, publicJson, publicPlanRequired, publicPreflight } from "@/lib/api/public";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * GET /api/public/v1/projects/{id}/units/{slug}: én enhet med det som vises
 * på enhetssiden (plantegninger, bilder, dokumenter og offentlige egne felt).
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/public/v1/projects/[id]/units/[slug]">) {
  const { id, slug } = await params;
  if (!UUID_PATTERN.test(id) || !/^[a-z0-9-]{1,80}$/.test(slug)) {
    return publicError(400, "invalid_id", "Ugyldig prosjekt eller enhet.");
  }
  const supabase = await createPublicClient();
  const [{ data, error }, allowed] = await Promise.all([
    supabase.rpc("get_public_unit", { p_project_id: id, p_slug: slug }),
    supabase.rpc("integration_allowed", { p_feature: "api", p_project_id: id }),
  ]);
  if (error || allowed.error) {
    Sentry.captureException(error ?? allowed.error);
    return publicError(500, "server_error", "Noe gikk galt. Prøv igjen.");
  }
  if (!data) {
    return publicError(404, "not_found", "Fant ingen publisert enhet med denne adressen.");
  }
  return allowed.data ? publicJson(data) : publicPlanRequired();
}

export function OPTIONS() {
  return publicPreflight();
}
