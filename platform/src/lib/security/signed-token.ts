/**
 * Signerte tokener med utløp (HMAC-SHA256), for lenker som skal virke uten
 * innlogging, for eksempel delt forhåndsvisning av en prosjektside.
 *
 *   {base64url(JSON med data og utløp)}.{base64url(signatur)}
 *
 * Nøkkelen avledes med HKDF fra en hemmelighet på serveren og et formål, så
 * et token for ett formål aldri gjelder for et annet.
 */

import { createHmac, hkdfSync, timingSafeEqual } from "node:crypto";

export function deriveKey(secret: string, purpose: string): Buffer {
  return Buffer.from(hkdfSync("sha256", secret, "boligplattform", purpose, 32));
}

function sign(key: Buffer, value: string): string {
  return createHmac("sha256", key).update(value).digest("base64url");
}

export function signToken<T extends Record<string, unknown>>(data: T, key: Buffer, expiresAt: Date): string {
  const payload = Buffer.from(JSON.stringify({ ...data, exp: Math.floor(expiresAt.getTime() / 1000) })).toString("base64url");
  return `${payload}.${sign(key, payload)}`;
}

/** Data fra et gyldig token, eller null hvis signaturen er feil, tokenet er ødelagt eller har gått ut. */
export function verifyToken(token: string, key: Buffer, now: Date = new Date()): (Record<string, unknown> & { exp: number }) | null {
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0 || token.length > 2000) {
    return null;
  }
  const expected = Buffer.from(sign(key, payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }
  try {
    const data: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data !== "object" || data === null || typeof (data as { exp?: unknown }).exp !== "number") {
      return null;
    }
    const value = data as Record<string, unknown> & { exp: number };
    return value.exp * 1000 > now.getTime() ? value : null;
  } catch {
    return null;
  }
}
