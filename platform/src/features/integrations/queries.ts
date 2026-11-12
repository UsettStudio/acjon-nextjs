import "server-only";

import type { ApiKeyScope, WebhookEvent } from "@/features/integrations/schemas";
import { createClient } from "@/lib/supabase/server";

export type ApiKeyItem = {
  id: string;
  name: string;
  prefix: string;
  scopes: ApiKeyScope[];
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  state: "active" | "revoked" | "expired";
};

export type WebhookDeliveryItem = {
  id: string;
  event: string;
  status: "pending" | "succeeded" | "failed";
  attempts: number;
  responseStatus: number | null;
  error: string | null;
  createdAt: string;
  deliveredAt: string | null;
  nextAttemptAt: string;
};

export type WebhookItem = {
  id: string;
  url: string;
  description: string | null;
  events: WebhookEvent[];
  projectIds: string[];
  isActive: boolean;
  failureCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  deliveries: WebhookDeliveryItem[];
};

export type IntegrationsData = {
  apiKeys: ApiKeyItem[];
  webhooks: WebhookItem[];
  projects: { id: string; name: string }[];
};

/** API-nøkler (uten selve nøkkelen), webhooks (uten hemmeligheten) og de siste leveransene. Eier og administrator. */
export async function getIntegrationsData(organizationId: string): Promise<IntegrationsData> {
  const supabase = await createClient();
  const [keys, webhooks, deliveries, projects] = await Promise.all([
    supabase
      .from("api_keys")
      .select("id, name, key_prefix, scopes, created_at, last_used_at, expires_at, revoked_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
    supabase
      .from("webhooks")
      .select("id, url, description, events, project_ids, is_active, failure_count, last_success_at, last_failure_at, created_at")
      .eq("organization_id", organizationId)
      .order("created_at"),
    supabase
      .from("webhook_deliveries")
      .select("id, webhook_id, event, status, attempts, last_response_status, last_error, created_at, delivered_at, next_attempt_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("projects").select("id, name").eq("organization_id", organizationId).order("name"),
  ]);
  const now = Date.now();
  for (const result of [keys, webhooks, deliveries, projects]) {
    if (result.error) {
      throw result.error;
    }
  }
  const deliveriesByWebhook = new Map<string, WebhookDeliveryItem[]>();
  for (const row of deliveries.data ?? []) {
    const list = deliveriesByWebhook.get(row.webhook_id) ?? [];
    if (list.length < 20) {
      list.push({
        id: row.id,
        event: row.event,
        status: row.status as WebhookDeliveryItem["status"],
        attempts: row.attempts,
        responseStatus: row.last_response_status,
        error: row.last_error,
        createdAt: row.created_at,
        deliveredAt: row.delivered_at,
        nextAttemptAt: row.next_attempt_at,
      });
      deliveriesByWebhook.set(row.webhook_id, list);
    }
  }
  return {
    apiKeys: (keys.data ?? []).map((key) => ({
      id: key.id,
      name: key.name,
      prefix: key.key_prefix,
      scopes: key.scopes as ApiKeyScope[],
      createdAt: key.created_at,
      lastUsedAt: key.last_used_at,
      expiresAt: key.expires_at,
      revokedAt: key.revoked_at,
      state: key.revoked_at ? "revoked" : key.expires_at && new Date(key.expires_at).getTime() <= now ? "expired" : "active",
    })),
    webhooks: (webhooks.data ?? []).map((webhook) => ({
      id: webhook.id,
      url: webhook.url,
      description: webhook.description,
      events: webhook.events as WebhookEvent[],
      projectIds: webhook.project_ids ?? [],
      isActive: webhook.is_active,
      failureCount: webhook.failure_count,
      lastSuccessAt: webhook.last_success_at,
      lastFailureAt: webhook.last_failure_at,
      deliveries: deliveriesByWebhook.get(webhook.id) ?? [],
    })),
    projects: projects.data ?? [],
  };
}
