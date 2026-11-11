import "server-only";

import { createHash, randomBytes } from "node:crypto";

/** Tilfeldig token for lenker i e-post (256 bit, URL-sikker). */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 som hex. Databasen lagrer bare hashen av tokenet. */
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
