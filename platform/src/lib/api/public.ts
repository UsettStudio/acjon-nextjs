import "server-only";

/**
 * Felles svar for det offentlige lese-API-et (/api/public/v1). Bare publiserte
 * data, uten innlogging, og med CORS for alle opprinnelser, så andre nettsteder
 * kan hente dataene direkte fra nettleseren.
 *
 * Svarene mellomlagres i CDN-et i høyst tre sekunder (pluss to sekunder mens
 * nytt svar hentes), så en statusendring er ute innen fem sekunder.
 */

export const PUBLIC_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

const COMMON_HEADERS = {
  ...PUBLIC_CORS_HEADERS,
  "X-Content-Type-Options": "nosniff",
} as const;

export function publicJson(data: unknown): Response {
  return Response.json(data, {
    headers: { ...COMMON_HEADERS, "Cache-Control": "public, max-age=0, s-maxage=3, stale-while-revalidate=2" },
  });
}

export function publicError(status: 400 | 403 | 404 | 500, code: string, message: string): Response {
  return Response.json(
    { error: { code, message } },
    {
      status,
      headers: {
        ...COMMON_HEADERS,
        "Cache-Control": status === 404 || status === 403 ? "public, max-age=0, s-maxage=10" : "no-store",
      },
    },
  );
}

/** Pakken til prosjektet har ikke det offentlige lese-API-et (bare Pro, Partner og prøveperioden). */
export function publicPlanRequired(): Response {
  return publicError(403, "plan_required", "Det offentlige API-et er ikke med i pakken til dette prosjektet.");
}

export function publicPreflight(): Response {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
}

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
