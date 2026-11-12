import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  resendApiKey: z.string().optional(),
  emailFrom: z.string().min(3),
  /** Hemmelig Supabase-nøkkel (service-rollen). Brukes bare på serveren: leads og delt forhåndsvisning. */
  supabaseSecretKey: z.string().min(1).optional(),
  /** Cloudflare Turnstile. Uten nøkkel brukes bare honeypot og rate limit (lokalt og i tester). */
  turnstileSecretKey: z.string().min(1).optional(),
  /** Bare lokalt og i tester: e-post uten Resend sendes til Mailpit i lokal Supabase. */
  mailpitUrl: z.url().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse({
    resendApiKey: process.env.RESEND_API_KEY || undefined,
    emailFrom: process.env.EMAIL_FROM || "Boligplattform <noreply@example.com>",
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || undefined,
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || undefined,
    mailpitUrl: process.env.MAILPIT_URL || undefined,
  });
  return cached;
}
