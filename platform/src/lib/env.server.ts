import "server-only";

import { z } from "zod";

const optional = z.string().min(1).optional();

const serverEnvSchema = z.object({
  resendApiKey: optional,
  emailFrom: z.string().min(3),
  /**
   * Hemmelig Supabase-nøkkel (service-rollen). Brukes bare på serveren: leads,
   * delt forhåndsvisning, Stripe-webhooken, domenesjekk, API med nøkkel og
   * webhook-utsending. Alle kall går gjennom databasefunksjoner med egne kontroller.
   */
  supabaseSecretKey: optional,
  /** Cloudflare Turnstile. Uten nøkkel brukes bare honeypot og rate limit (lokalt og i tester). */
  turnstileSecretKey: optional,
  /** Bare lokalt og i tester: e-post uten Resend sendes til Mailpit i lokal Supabase. */
  mailpitUrl: z.url().optional(),

  /** Stripe. Uten nøkkel vises pakkene, men betaling er ikke mulig. */
  stripeSecretKey: optional,
  stripeWebhookSecret: optional,
  /** Månedsprisene for pakkene (price_…). */
  stripePrices: z.object({ start: optional, pro: optional, partner: optional }),
  /** Produktet oppstartsavgiften faktureres som (prod_…). Beløpet regnes ut i appen (lib/billing/launch.ts). */
  stripeLaunchProduct: z.string().regex(/^prod_[A-Za-z0-9_]+$/).optional(),
  /** Bare i tester: en lokal etterligning av Stripe sitt API, f.eks. http://127.0.0.1:12111. */
  stripeApiBase: z.url().optional(),
  /** Stripe Tax: legger til mva. automatisk i Checkout når det er satt opp i Stripe. */
  stripeAutomaticTax: z.boolean(),

  /** Vercel Domains API for egne domener. Uten token sjekkes domener bare med DNS. */
  vercelApiToken: optional,
  vercelProjectId: optional,
  vercelTeamId: optional,
  /** DNS-oppslag for domenesjekk (DNS over HTTPS, JSON-format). */
  dnsOverHttpsUrl: z.url(),
  /** Hva egne domener skal peke på når Vercel ikke oppgir noe annet. */
  domainCnameTarget: z.string().min(3),
  domainARecord: z.ipv4(),
  /** Navnet på TXT-posten som bekrefter eierskapet: {prefix}.{domene}. */
  domainTxtPrefix: z.string().regex(/^_[a-z0-9-]{1,40}$/),

  /** Vercel Cron sender «Authorization: Bearer {CRON_SECRET}» til jobbene under /api/cron. */
  cronSecret: optional,
  /** Vises på Abonnement-siden og lanseringen for avtaler utenom pakkene. */
  supportEmail: z.email().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

function value(name: string): string | undefined {
  return process.env[name] || undefined;
}

export function serverEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse({
    resendApiKey: value("RESEND_API_KEY"),
    emailFrom: process.env.EMAIL_FROM || "excip <noreply@example.com>",
    supabaseSecretKey: value("SUPABASE_SECRET_KEY"),
    turnstileSecretKey: value("TURNSTILE_SECRET_KEY"),
    mailpitUrl: value("MAILPIT_URL"),
    stripeSecretKey: value("STRIPE_SECRET_KEY"),
    stripeWebhookSecret: value("STRIPE_WEBHOOK_SECRET"),
    stripePrices: {
      start: value("STRIPE_PRICE_START"),
      pro: value("STRIPE_PRICE_PRO"),
      partner: value("STRIPE_PRICE_PARTNER"),
    },
    stripeLaunchProduct: value("STRIPE_PRODUCT_LAUNCH"),
    stripeApiBase: value("STRIPE_API_BASE"),
    stripeAutomaticTax: process.env.STRIPE_AUTOMATIC_TAX === "true",
    vercelApiToken: value("VERCEL_API_TOKEN"),
    vercelProjectId: value("VERCEL_PROJECT_ID"),
    vercelTeamId: value("VERCEL_TEAM_ID"),
    dnsOverHttpsUrl: value("DNS_OVER_HTTPS_URL") ?? "https://cloudflare-dns.com/dns-query",
    domainCnameTarget: value("DOMAIN_CNAME_TARGET") ?? "cname.vercel-dns.com",
    domainARecord: value("DOMAIN_A_RECORD") ?? "76.76.21.21",
    domainTxtPrefix: value("DOMAIN_TXT_PREFIX") ?? "_excip",
    cronSecret: value("CRON_SECRET"),
    supportEmail: value("SUPPORT_EMAIL"),
  });
  return cached;
}
