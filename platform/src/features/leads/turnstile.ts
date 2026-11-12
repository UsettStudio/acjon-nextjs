import "server-only";

import { serverEnv } from "@/lib/env.server";

/**
 * Kontrollerer Cloudflare Turnstile-tokenet på serveren. Uten hemmelig nøkkel
 * (lokalt og i tester) hoppes kontrollen over, og bare honeypot og rate limit gjelder.
 */
export async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = serverEnv().turnstileSecretKey;
  if (!secret) {
    return true;
  }
  if (!token) {
    return false;
  }
  const body = new URLSearchParams({ secret, response: token });
  if (ip) {
    body.set("remoteip", ip);
  }
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
