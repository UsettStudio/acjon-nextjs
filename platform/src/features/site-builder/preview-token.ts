import "server-only";

import { serverEnv } from "@/lib/env.server";
import { deriveKey, signToken, verifyToken } from "@/lib/security/signed-token";

const PURPOSE = "prosjektside-forhandsvisning";
export const PREVIEW_DAYS = 7;

function key(): Buffer {
  const secret = serverEnv().supabaseSecretKey;
  if (!secret) {
    throw new Error("SUPABASE_SECRET_KEY mangler. Den trengs for delt forhåndsvisning.");
  }
  return deriveKey(secret, PURPOSE);
}

/** Lenke til utkastet som kan deles uten innlogging. Gyldig i sju dager. */
export function createPreviewToken(siteId: string, now: Date = new Date()): { token: string; expiresAt: Date } {
  const expiresAt = new Date(now.getTime() + PREVIEW_DAYS * 24 * 60 * 60 * 1000);
  return { token: signToken({ site: siteId }, key(), expiresAt), expiresAt };
}

export function readPreviewToken(token: string): { siteId: string; expiresAt: Date } | null {
  if (!serverEnv().supabaseSecretKey) {
    return null;
  }
  const data = verifyToken(token, key());
  return data && typeof data.site === "string" ? { siteId: data.site, expiresAt: new Date(data.exp * 1000) } : null;
}
