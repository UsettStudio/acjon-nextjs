import { z } from "zod";

/**
 * Offentlige miljøvariabler. Next.js bygger dem inn i klientkoden, så de må
 * refereres eksplisitt (ikke via process.env[navn]).
 */
const publicEnvSchema = z.object({
  supabaseUrl: z.url(),
  supabasePublishableKey: z.string().min(1),
  appUrl: z.url(),
  platformDomain: z.string().min(1),
  productName: z.string().min(1),
  sentryDsn: z.string().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

let cached: PublicEnv | undefined;

export function publicEnv(): PublicEnv {
  cached ??= publicEnvSchema.parse({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    platformDomain: process.env.NEXT_PUBLIC_PLATFORM_DOMAIN,
    productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || "Boligplattform",
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  });
  return cached;
}

/** Absolutt URL i admin-appen, f.eks. til lenker i e-post. */
export function appUrl(path: string): string {
  return new URL(path, publicEnv().appUrl).toString();
}
