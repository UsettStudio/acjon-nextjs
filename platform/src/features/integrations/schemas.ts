import { z } from "zod";

/** Tilgangene en API-nøkkel kan ha. Samme liste som CHECK-regelen på api_keys.scopes. */
export const API_KEY_SCOPES = ["projects:read", "units:read", "units:write", "leads:read"] as const;
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

/** Hendelsene en webhook kan få. Samme liste som CHECK-regelen på webhooks.events. */
export const WEBHOOK_EVENTS = ["unit.status_changed", "lead.created"] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export const API_KEY_EXPIRY_DAYS = [30, 90, 365] as const;

export const apiKeySchema = z.object({
  name: z.string().trim().min(1, { error: "required" }).max(200, { error: "textTooLong" }),
  scopes: z.array(z.enum(API_KEY_SCOPES)).min(1, { error: "scopesRequired" }),
  expiresInDays: z.union([z.literal(30), z.literal(90), z.literal(365), z.null()]),
});
export type ApiKeyInput = z.input<typeof apiKeySchema>;

export const webhookSchema = z.object({
  url: z
    .string()
    .trim()
    .max(2048, { error: "textTooLong" })
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
      } catch {
        return false;
      }
    }, { error: "httpsRequired" }),
  description: z.string().trim().max(500, { error: "textTooLong" }),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1, { error: "eventsRequired" }),
  /** Tom liste betyr alle prosjekter. */
  projectIds: z.array(z.uuid()).max(500),
  isActive: z.boolean(),
});
export type WebhookInput = z.input<typeof webhookSchema>;
