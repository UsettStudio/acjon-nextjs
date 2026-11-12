"use server";

import { randomBytes } from "node:crypto";
import { isIP } from "node:net";

import { refresh } from "next/cache";
import { z } from "zod";

import { isPrivateAddress } from "@/features/integrations/network";
import { apiKeySchema, webhookSchema, type ApiKeyInput, type WebhookInput } from "@/features/integrations/schemas";
import { deliverNow, type DeliveryResult } from "@/features/integrations/webhook-sender";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { ActionError, parseInput, postgresErrorCode, requireOrgCapability, runAction } from "@/lib/actions/server";
import { API_KEY_PREFIX } from "@/lib/api/keyed";
import { sha256Hex } from "@/lib/security/tokens";
import { createClient } from "@/lib/supabase/server";

const uuid = z.uuid();

function requireId(value: unknown): string {
  const parsed = uuid.safeParse(value);
  if (!parsed.success) {
    throw new ActionError("invalidInput");
  }
  return parsed.data;
}

function writeError(error: unknown): never {
  if (postgresErrorCode(error) === "42501") {
    throw new ActionError("forbidden");
  }
  // Pakken har ikke API eller webhooks (app.require_plan_feature).
  if (postgresErrorCode(error) === "P0403") {
    throw new ActionError("planFeature");
  }
  throw error;
}

/** Hemmeligheten for HMAC-signaturen, i formatet til Standard Webhooks. */
function newWebhookSecret(): string {
  return `whsec_${randomBytes(32).toString("base64")}`;
}

/** Adresser som åpenbart peker inn i et privat nett, avvises allerede ved lagring. */
function webhookUrlProblem(url: string): boolean {
  const host = new URL(url).hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || (isIP(host) !== 0 && isPrivateAddress(host));
}

// -----------------------------------------------------------------------------
// API-nøkler
// -----------------------------------------------------------------------------

/**
 * Lager en API-nøkkel. Nøkkelen vises bare i svaret; databasen lagrer en
 * SHA-256-hash og de første tegnene, så nøkkelen kan kjennes igjen i listen.
 */
export async function createApiKey(input: { organizationId: string } & ApiKeyInput): Promise<ActionResult<{ id: string; key: string }>> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    await requireOrgCapability(organizationId, "integrations.manage");
    const parsed = parseInput(apiKeySchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const key = `${API_KEY_PREFIX}${randomBytes(32).toString("base64url")}`;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        organization_id: organizationId,
        name: parsed.data.name,
        key_prefix: key.slice(0, 12),
        key_hash: sha256Hex(key),
        scopes: parsed.data.scopes,
        expires_at: parsed.data.expiresInDays ? new Date(Date.now() + parsed.data.expiresInDays * 86_400_000).toISOString() : null,
      })
      .select("id")
      .single();
    if (error) {
      writeError(error);
    }
    refresh();
    return ok({ id: data.id, key });
  });
}

/** Trekker tilbake en nøkkel. Den slutter å virke med en gang og blir stående i listen. */
export async function revokeApiKey(input: { organizationId: string; keyId: string }): Promise<ActionResult> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    await requireOrgCapability(organizationId, "integrations.manage");
    const supabase = await createClient();
    const { error } = await supabase
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", requireId(input.keyId))
      .eq("organization_id", organizationId)
      .is("revoked_at", null)
      .select("id")
      .single();
    if (error) {
      writeError(error);
    }
    refresh();
    return ok();
  });
}

// -----------------------------------------------------------------------------
// Webhooks
// -----------------------------------------------------------------------------

type WebhookError = "privateUrl";

export async function createWebhook(
  input: { organizationId: string } & WebhookInput,
): Promise<ActionResult<{ id: string; secret: string }, WebhookError>> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    await requireOrgCapability(organizationId, "integrations.manage");
    const parsed = parseInput(webhookSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    if (webhookUrlProblem(parsed.data.url)) {
      return fail("privateUrl", { url: "webhookPrivateUrl" });
    }
    const secret = newWebhookSecret();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("webhooks")
      .insert({
        organization_id: organizationId,
        url: parsed.data.url,
        description: parsed.data.description || null,
        events: parsed.data.events,
        project_ids: parsed.data.projectIds.length > 0 ? parsed.data.projectIds : null,
        is_active: parsed.data.isActive,
        secret,
      })
      .select("id")
      .single();
    if (error) {
      writeError(error);
    }
    refresh();
    return ok({ id: data.id, secret });
  });
}

export async function updateWebhook(
  input: { organizationId: string; webhookId: string } & WebhookInput,
): Promise<ActionResult<undefined, WebhookError>> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    await requireOrgCapability(organizationId, "integrations.manage");
    const parsed = parseInput(webhookSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    if (webhookUrlProblem(parsed.data.url)) {
      return fail("privateUrl", { url: "webhookPrivateUrl" });
    }
    const supabase = await createClient();
    const { error } = await supabase
      .from("webhooks")
      .update({
        url: parsed.data.url,
        description: parsed.data.description || null,
        events: parsed.data.events,
        project_ids: parsed.data.projectIds.length > 0 ? parsed.data.projectIds : null,
        is_active: parsed.data.isActive,
      })
      .eq("id", requireId(input.webhookId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      writeError(error);
    }
    refresh();
    return ok();
  });
}

export async function deleteWebhook(input: { organizationId: string; webhookId: string }): Promise<ActionResult> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    await requireOrgCapability(organizationId, "integrations.manage");
    const supabase = await createClient();
    const { error } = await supabase
      .from("webhooks")
      .delete()
      .eq("id", requireId(input.webhookId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      writeError(error);
    }
    refresh();
    return ok();
  });
}

/** Viser hemmeligheten, eller lager en ny (rotate). Den gamle slutter å gjelde med en gang. */
export async function webhookSecret(input: {
  organizationId: string;
  webhookId: string;
  rotate: boolean;
}): Promise<ActionResult<{ secret: string }>> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    await requireOrgCapability(organizationId, "integrations.manage", { allowReadOnly: !input.rotate });
    const supabase = await createClient();
    const webhookId = requireId(input.webhookId);
    if (input.rotate) {
      const secret = newWebhookSecret();
      const { error } = await supabase
        .from("webhooks")
        .update({ secret })
        .eq("id", webhookId)
        .eq("organization_id", organizationId)
        .select("id")
        .single();
      if (error) {
        writeError(error);
      }
      return ok({ secret });
    }
    const { data, error } = await supabase
      .from("webhooks")
      .select("secret")
      .eq("id", webhookId)
      .eq("organization_id", organizationId)
      .single();
    if (error) {
      writeError(error);
    }
    return ok({ secret: data.secret });
  });
}

/** «Send testhendelse»: lager en testleveranse og sender den med en gang. */
export async function sendTestWebhook(input: { organizationId: string; webhookId: string }): Promise<ActionResult<DeliveryResult>> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    await requireOrgCapability(organizationId, "integrations.manage");
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("send_test_webhook", { p_webhook_id: requireId(input.webhookId) });
    if (error) {
      writeError(error);
    }
    const result = await deliverNow(data);
    refresh();
    return result ? ok(result) : fail("unknown");
  });
}

/** «Prøv igjen» på en leveranse som har feilet. Sendes med en gang. */
export async function retryWebhookDelivery(input: {
  organizationId: string;
  deliveryId: string;
}): Promise<ActionResult<DeliveryResult>> {
  return runAction(async () => {
    const organizationId = requireId(input.organizationId);
    await requireOrgCapability(organizationId, "integrations.manage");
    const deliveryId = requireId(input.deliveryId);
    const supabase = await createClient();
    const { error } = await supabase.rpc("retry_webhook_delivery", { p_delivery_id: deliveryId });
    if (error) {
      if (postgresErrorCode(error) === "22023") {
        return fail("invalidInput");
      }
      writeError(error);
    }
    const result = await deliverNow(deliveryId);
    refresh();
    return result ? ok(result) : fail("unknown");
  });
}
