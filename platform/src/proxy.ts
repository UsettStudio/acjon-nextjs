import { NextResponse, type NextRequest } from "next/server";

import { ORG_SLUG_PATTERN, RESERVED_ORG_SLUGS } from "@/features/organizations/slug";
import { publicEnv } from "@/lib/env";
import { classifyHost } from "@/lib/hosts";
import { safeNextPath } from "@/lib/navigation/safe-redirect";
import { updateSession } from "@/lib/supabase/proxy";

/** Sider som kan vises uten innlogging. */
const PUBLIC_EXACT = new Set(["/login", "/signup", "/forgot-password", "/robots.txt"]);
// /embed/: publisert boligvelger og enhetssider. Forhåndsvisningen der sjekker innlogging selv.
// /preview/: delt forhåndsvisning av en prosjektside, med signert lenke som kontrolleres på siden.
const PUBLIC_PREFIXES = ["/auth/", "/invite/", "/embed/", "/preview/"];
/** Innloggingssider en innlogget bruker ikke trenger å se. */
const GUEST_ONLY = new Set(["/login", "/signup", "/forgot-password"]);

function isPublicPath(pathname: string): boolean {
  return PUBLIC_EXACT.has(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function redirectWithCookies(url: URL, source: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url);
  for (const cookie of source.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

/**
 * Fornyer innloggingen på hver forespørsel og sender uinnloggede brukere til
 * innlogging. Hver side og serverhandling sjekker likevel tilgang selv.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const env = publicEnv();
  const host = classifyHost(request.headers.get("host") ?? "", env.appUrl, env.platformDomain);

  // Publiserte prosjektsider: skrives om til app/sites/[site]. Ingen innlogging og ingen cookies.
  if (host.kind === "site") {
    const url = request.nextUrl.clone();
    url.pathname = `/sites/${encodeURIComponent(host.key)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }
  // Prosjektsidene skal bare nås via eget vertsnavn, ikke som /sites/ på admin.
  if (pathname === "/sites" || pathname.startsWith("/sites/")) {
    return new NextResponse(null, { status: 404 });
  }

  const { response, userId } = await updateSession(request);

  if (!userId && !isPublicPath(pathname)) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") {
      url.searchParams.set("next", `${pathname}${search}`);
    }
    return redirectWithCookies(url, response);
  }

  if (userId && GUEST_ONLY.has(pathname)) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    return redirectWithCookies(new URL(next, request.url), response);
  }

  // Husk sist brukte organisasjon, så forsiden kan sende brukeren dit neste gang.
  const firstSegment = pathname.split("/")[1] ?? "";
  if (userId && ORG_SLUG_PATTERN.test(firstSegment) && !RESERVED_ORG_SLUGS.has(firstSegment)) {
    if (request.cookies.get("last_org")?.value !== firstSegment) {
      response.cookies.set("last_org", firstSegment, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
