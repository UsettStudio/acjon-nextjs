/**
 * Etterligning av Stripe og DNS over HTTPS (e2e/support/fake-services.mjs).
 * Appen peker til den med miljøvariabler (playwright.config.ts), så abonnement
 * og egne domener kan testes uten kontoer hos Stripe og Vercel.
 */
export const E2E_SERVICES = {
  port: Number(process.env.E2E_SERVICES_PORT ?? 12111),
  stripeWebhookSecret: "whsec_e2e_stripe_signering",
  cronSecret: "e2e-cron-hemmelighet",
  /** Egne domener i testene. Chromium sender dem til appen (se launchOptions i playwright.config.ts). */
  customDomainSuffix: "e2etest.no",
};

export const servicesUrl = `http://127.0.0.1:${E2E_SERVICES.port}`;

/** Setter DNS-poster i etterligningen av DNS over HTTPS. */
export async function setDnsRecord(name: string, type: "TXT" | "CNAME" | "A", values: string[]) {
  const response = await fetch(`${servicesUrl}/_control/dns`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, type, values }),
  });
  if (!response.ok) {
    throw new Error(`Kunne ikke sette DNS-post: ${response.status}`);
  }
}
