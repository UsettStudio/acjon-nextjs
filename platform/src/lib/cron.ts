import "server-only";

import { timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/lib/env.server";

/**
 * Planlagte jobber under /api/cron kalles av Vercel Cron med
 * «Authorization: Bearer {CRON_SECRET}». Svarer med en feil når kallet ikke er
 * godkjent, ellers null.
 */
export function rejectUnauthorizedCron(request: Request): Response | null {
  const secret = serverEnv().cronSecret;
  if (!secret) {
    return Response.json({ error: "CRON_SECRET er ikke satt" }, { status: 503 });
  }
  const given = Buffer.from(request.headers.get("authorization") ?? "", "utf8");
  const expected = Buffer.from(`Bearer ${secret}`, "utf8");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
