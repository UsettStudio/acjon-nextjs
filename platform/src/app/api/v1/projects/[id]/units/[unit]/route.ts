import { revalidateTag } from "next/cache";

import { scheduleWebhookDelivery } from "@/features/integrations/webhook-sender";
import { siteTags } from "@/features/site-builder/render-data";
import { UUID, apiError, apiErrorFromDatabase, apiJson, keyHashFrom, unauthorized } from "@/lib/api/keyed";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/v1/projects/{id}/units/{enhet}: endrer status (med valgfritt
 * notat) og prisfeltene på én enhet, oppgitt med id eller enhetsnummer.
 * Endringen logges med kilden «api», går ut i sanntid og som webhook, og
 * publiserte sider viser den med en gang. Krever units:write.
 *
 *   { "status": "sold", "note": "Solgt via meglersystemet", "price": 4250000 }
 */
export async function PATCH(request: Request, { params }: RouteContext<"/api/v1/projects/[id]/units/[unit]">) {
  const keyHash = keyHashFrom(request);
  if (!keyHash) {
    return unauthorized();
  }
  const { id, unit } = await params;
  const unitRef = decodeURIComponent(unit);
  if (!UUID.test(id) || unitRef.length === 0 || unitRef.length > 100) {
    return apiError(400, "invalid_request", "Ugyldig prosjekt eller enhet.");
  }
  let changes: unknown;
  try {
    changes = await request.json();
  } catch {
    return apiError(400, "invalid_json", "Innholdet må være JSON.");
  }
  if (typeof changes !== "object" || changes === null || Array.isArray(changes)) {
    return apiError(400, "invalid_request", "Innholdet må være et JSON-objekt.");
  }
  const { data, error } = await createAdminClient().rpc("api_update_unit", {
    p_key_hash: keyHash,
    p_project_id: id,
    p_unit: unitRef,
    p_changes: changes as never,
  });
  if (error) {
    return apiErrorFromDatabase(error);
  }
  revalidateTag(siteTags.units(id), { expire: 0 });
  scheduleWebhookDelivery();
  return apiJson(data);
}
