import path from "node:path";

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs/config";

// Sikkerhetshoder for alle svar. En full Content-Security-Policy med nonce kommer i fase 5.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

// Admin og innlogging skal aldri vises i en iframe. Innbygging (/embed, fase 4) får egne regler.
const noFramingHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

// Forhåndsvisningen i prosjektsideeditoren vises i en iframe i admin, og bare der.
const sameOriginFramingHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    // Repoet har også nettsidens package-lock.json i rotmappen. Plattformen er sitt eget prosjekt.
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/((?!embed/|site-preview/).*)", headers: noFramingHeaders },
      { source: "/site-preview/:path*", headers: sameOriginFramingHeaders },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Kildekart lastes bare opp når SENTRY_AUTH_TOKEN er satt (CI/Vercel). Telemetri til Sentry er av.
export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  widenClientFileUpload: true,
});
