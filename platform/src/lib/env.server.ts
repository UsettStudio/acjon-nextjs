import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  resendApiKey: z.string().optional(),
  emailFrom: z.string().min(3),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse({
    resendApiKey: process.env.RESEND_API_KEY || undefined,
    emailFrom: process.env.EMAIL_FROM || "Boligplattform <noreply@example.com>",
  });
  return cached;
}
