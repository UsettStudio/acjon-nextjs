import "server-only";

import { createHmac } from "node:crypto";
import { lookup as dnsLookup, type LookupAddress } from "node:dns";
import { request as httpsRequest } from "node:https";
import { isIP, type LookupFunction } from "node:net";

import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";

import { BlockedAddressError, isPrivateAddress } from "@/features/integrations/network";
import { serverEnv } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Utsending av webhooks fra utboksen (webhook_deliveries). Formatet følger
 * Standard Webhooks (standardwebhooks.com):
 *
 *   webhook-id:        id-en til hendelsen (samme ved nye forsøk)
 *   webhook-timestamp: tidspunktet for sendingen i sekunder
 *   webhook-signature: v1,{base64(HMAC-SHA256(nøkkel, "{id}.{tidspunkt}.{innhold}"))}
 *
 * Nøkkelen er hemmeligheten uten «whsec_», base64-dekodet. Mottakeren kan
 * dermed bruke de vanlige bibliotekene for Standard Webhooks.
 * Svar 2xx er levert. Alt annet (også omdirigering) gir nytt forsøk senere.
 */

export type ClaimedDelivery = {
  delivery_id: string;
  webhook_id: string;
  url: string;
  secret: string;
  event: string;
  payload: unknown;
  attempt: number;
};

export type DeliveryRequest = { url: string; headers: Record<string, string>; body: string };
export type DeliveryResult = { succeeded: boolean; status: number | null; error: string | null };
export type WebhookTransport = (request: DeliveryRequest) => Promise<{ status: number }>;

const TIMEOUT_MS = 10_000;

function signingKey(secret: string): Buffer {
  return secret.startsWith("whsec_") ? Buffer.from(secret.slice("whsec_".length), "base64") : Buffer.from(secret, "utf8");
}

export function signWebhook(secret: string, messageId: string, timestamp: number, body: string): string {
  const signature = createHmac("sha256", signingKey(secret)).update(`${messageId}.${timestamp}.${body}`).digest("base64");
  return `v1,${signature}`;
}

/** Id-en til hendelsen i innholdet. Faller tilbake på leveransen. */
function messageIdOf(delivery: ClaimedDelivery): string {
  const id = (delivery.payload as { id?: unknown } | null)?.id;
  return typeof id === "string" ? `msg_${id}` : `msg_${delivery.delivery_id}`;
}

export function buildDeliveryRequest(delivery: ClaimedDelivery, now: Date = new Date()): DeliveryRequest {
  const body = JSON.stringify(delivery.payload);
  const timestamp = Math.floor(now.getTime() / 1000);
  const messageId = messageIdOf(delivery);
  return {
    url: delivery.url,
    body,
    headers: {
      "content-type": "application/json",
      "user-agent": "Boligplattform-Webhooks/1.0",
      "webhook-id": messageId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": signWebhook(delivery.secret, messageId, timestamp, body),
    },
  };
}

/** DNS-oppslag som avviser private adresser, så et vertsnavn ikke kan peke inn i nettverket vårt. */
const safeLookup: LookupFunction = (hostname, options, callback) => {
  dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) {
      callback(error, "", 4);
      return;
    }
    const list = addresses as unknown as LookupAddress[];
    const blocked = list.find((entry) => isPrivateAddress(entry.address));
    if (blocked || list.length === 0) {
      callback(new BlockedAddressError(blocked?.address ?? hostname), "", 4);
      return;
    }
    if (options.all) {
      (callback as unknown as (error: null, addresses: LookupAddress[]) => void)(null, list);
    } else {
      const first = list[0] as LookupAddress;
      callback(null, first.address, first.family);
    }
  });
};

/** HTTPS med SSRF-vern, tidsgrense og uten å følge omdirigeringer. Svaret leses ikke. */
export const httpsTransport: WebhookTransport = (request) =>
  new Promise((resolve, reject) => {
    const url = new URL(request.url);
    if (url.protocol !== "https:") {
      reject(new Error("Bare https er tillatt"));
      return;
    }
    const host = url.hostname.replace(/^\[|\]$/g, "");
    if (isIP(host) && isPrivateAddress(host)) {
      reject(new BlockedAddressError(host));
      return;
    }
    const outgoing = httpsRequest(
      url,
      {
        method: "POST",
        headers: { ...request.headers, "content-length": String(Buffer.byteLength(request.body)) },
        lookup: safeLookup,
        timeout: TIMEOUT_MS,
      },
      (response) => {
        response.resume();
        resolve({ status: response.statusCode ?? 0 });
      },
    );
    outgoing.on("timeout", () => outgoing.destroy(new Error("Tidsavbrudd etter 10 sekunder")));
    outgoing.on("error", reject);
    outgoing.end(request.body);
  });

export async function deliverWebhook(
  delivery: ClaimedDelivery,
  transport: WebhookTransport = httpsTransport,
  now: Date = new Date(),
): Promise<DeliveryResult> {
  try {
    const { status } = await transport(buildDeliveryRequest(delivery, now));
    if (status >= 200 && status < 300) {
      return { succeeded: true, status, error: null };
    }
    return { succeeded: false, status, error: `Mottakeren svarte ${status}` };
  } catch (error) {
    if (error instanceof BlockedAddressError) {
      return { succeeded: false, status: null, error: "Adressen peker til et privat nettverk og kan ikke brukes." };
    }
    return { succeeded: false, status: null, error: error instanceof Error ? error.message.slice(0, 500) : "Ukjent feil" };
  }
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function complete(admin: AdminClient, deliveryId: string, result: DeliveryResult) {
  const { error } = await admin.rpc("complete_webhook_delivery", {
    p_delivery_id: deliveryId,
    p_succeeded: result.succeeded,
    p_response_status: result.status ?? undefined,
    p_error: result.error ?? undefined,
  });
  if (error) {
    throw error;
  }
}

/** Sender leveransene som venter (høyst `limit`). Brukes av cron-jobben og etter hendelser. */
export async function processWebhookOutbox(
  options: { limit?: number; transport?: WebhookTransport } = {},
): Promise<{ attempted: number; succeeded: number }> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_webhook_deliveries", { p_limit: options.limit ?? 25 });
  if (error) {
    throw error;
  }
  const deliveries = data as ClaimedDelivery[];
  const results = await Promise.all(
    deliveries.map(async (delivery) => {
      const result = await deliverWebhook(delivery, options.transport);
      await complete(admin, delivery.delivery_id, result);
      return result.succeeded;
    }),
  );
  return { attempted: deliveries.length, succeeded: results.filter(Boolean).length };
}

/** Sender én leveranse med en gang (testhendelse og «Prøv igjen»). null hvis den ikke kunne hentes. */
export async function deliverNow(deliveryId: string, transport?: WebhookTransport): Promise<DeliveryResult | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_webhook_delivery", { p_delivery_id: deliveryId });
  if (error) {
    throw error;
  }
  const delivery = (data as ClaimedDelivery[])[0];
  if (!delivery) {
    return null;
  }
  const result = await deliverWebhook(delivery, transport);
  await complete(admin, delivery.delivery_id, result);
  return result;
}

/**
 * Sender nye hendelser rett etter svaret til brukeren (statusendring, nytt
 * lead, endring via API). Cron-jobben hvert minutt tar resten og nye forsøk.
 */
export function scheduleWebhookDelivery(): void {
  if (!serverEnv().supabaseSecretKey) {
    return;
  }
  after(async () => {
    try {
      await processWebhookOutbox({ limit: 25 });
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
    }
  });
}
