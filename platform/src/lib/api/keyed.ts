import "server-only";

import * as Sentry from "@sentry/nextjs";

import { postgresErrorCode } from "@/lib/actions/server";
import { sha256Hex } from "@/lib/security/tokens";

/**
 * API med nøkkel (/api/v1). Nøkkelen sendes som «Authorization: Bearer {nøkkel}».
 * Serveren lager SHA-256 av nøkkelen og sender bare hashen til databasen, der
 * api_*-funksjonene finner organisasjonen, kontrollerer tilgangene og holder
 * rate limit. API-et er for server-til-server: ingen CORS, så nøkler ikke havner
 * i nettlesere.
 */

export const API_KEY_PREFIX = "bpk_";

export function keyHashFrom(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  const key = match?.[1] ?? request.headers.get("x-api-key")?.trim() ?? "";
  if (!key.startsWith(API_KEY_PREFIX) || key.length < 20 || key.length > 200) {
    return null;
  }
  return sha256Hex(key);
}

const NO_STORE = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } as const;

export function apiJson(data: unknown, status = 200): Response {
  return Response.json({ data }, { status, headers: NO_STORE });
}

export function apiError(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status, headers: NO_STORE });
}

export function unauthorized(): Response {
  return apiError(401, "unauthorized", "Mangler eller ugyldig API-nøkkel. Send den som «Authorization: Bearer {nøkkel}».");
}

/** Feil fra api_*-funksjonene som HTTP-svar. */
export function apiErrorFromDatabase(error: unknown): Response {
  switch (postgresErrorCode(error)) {
    case "28000":
      return unauthorized();
    case "42501":
      return apiError(403, "forbidden", "API-nøkkelen har ikke tilgang til dette.");
    case "P0429":
      return apiError(429, "rate_limited", "For mange kall. Grensen er 600 kall i minuttet per nøkkel.");
    case "P0002":
      return apiError(404, "not_found", "Fant ikke det du ba om.");
    case "22023":
    case "22P02":
    case "23514":
      return apiError(400, "invalid_request", error instanceof Object && "message" in error ? String(error.message) : "Ugyldig forespørsel.");
    case "25006":
      return apiError(403, "read_only", "Organisasjonen er i lesemodus fordi abonnementet er utløpt.");
    default:
      console.error(error);
      Sentry.captureException(error);
      return apiError(500, "server_error", "Noe gikk galt. Prøv igjen.");
  }
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Tidspunkt fra spørringen (ISO 8601), eller null. undefined betyr ugyldig. */
export function timestampParam(value: string | null): string | null | undefined {
  if (value === null || value === "") {
    return null;
  }
  const time = Date.parse(value);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}
