import { defineConfig, devices } from "@playwright/test";

import { E2E_SERVICES, servicesUrl } from "./e2e/support/services";

const port = Number(process.env.E2E_PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;

/**
 * Ende-til-ende-tester mot en produksjonsbygget app (`npm run build` først) og
 * lokal Supabase (`npm run db:start`).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    locale: "nb-NO",
    timezoneId: "Europe/Oslo",
    trace: "off",
    launchOptions: {
      // Egne domener (www.prosjekt.e2etest.no) går til appen på maskinen, uten DNS.
      args: [`--host-resolver-rules=MAP *.${E2E_SERVICES.customDomainSuffix} 127.0.0.1`],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : [
        {
          command: "node e2e/support/fake-services.mjs",
          url: `${servicesUrl}/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
          env: {
            FAKE_SERVICES_PORT: String(E2E_SERVICES.port),
            FAKE_APP_URL: baseURL,
            FAKE_STRIPE_WEBHOOK_SECRET: E2E_SERVICES.stripeWebhookSecret,
          },
        },
        {
          command: `npm run start -- -p ${port}`,
          url: `${baseURL}/login`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            STRIPE_SECRET_KEY: "sk_test_e2e",
            STRIPE_WEBHOOK_SECRET: E2E_SERVICES.stripeWebhookSecret,
            STRIPE_PRICE_START: "price_e2e_start",
            STRIPE_PRICE_PRO: "price_e2e_pro",
            STRIPE_PRICE_PARTNER: "price_e2e_partner",
            STRIPE_PRODUCT_LAUNCH: "prod_e2e_launch",
            STRIPE_API_BASE: servicesUrl,
            DNS_OVER_HTTPS_URL: `${servicesUrl}/dns-query`,
            CRON_SECRET: E2E_SERVICES.cronSecret,
          },
        },
      ],
});
