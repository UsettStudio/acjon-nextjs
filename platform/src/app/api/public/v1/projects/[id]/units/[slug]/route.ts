import * as Sentry from "@sentry/nextjs";

import { UUID_PATTERN, publicError, publicJson, publicPreflight } from "@/lib/api/public";
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
  const { data, error } = await supabase.rpc("get_public_unit", { p_project_id: id, p_slug: slug });
  if (error) {
    Sentry.captureException(error);
    return publicError(500, "server_error", "Noe gikk galt. Prøv igjen.");
  }
  return data ? publicJson(data) : publicError(404, "not_found", "Fant ingen publisert enhet med denne adressen.");
}

export function OPTIONS() {
  return publicPreflight();
}
