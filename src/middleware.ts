import { NextResponse, type NextRequest } from "next/server";

/**
 * SEO: steng ute alle rester av Acjon-malen.
 *
 * Bakgrunn: malen la igjen ~55 ruter som fortsatt svarte 200 og var fullt
 * indekserbare – /shop, /team, /blog, /about, /service, /career, /pricing,
 * /faq og femten alternative forsider. Titlene deres var av typen
 * «Shop - Digital Agency & Creative Portfolio | Usett». Det fortalte Google
 * at usett.no er et generisk digitalbyrå og trakk ned hele domenets
 * kvalitetsprofil.
 *
 * Vi returnerer 410 Gone (ikke 404, ikke redirect):
 *   - 410 er et permanent «denne finnes ikke og kommer ikke tilbake».
 *     Google fjerner slike URL-er raskere fra indeksen enn 404.
 *   - Redirect til forsiden ville blitt tolket som soft-404, siden
 *     innholdet ikke har noe med forsiden å gjøre.
 *   - X-Robots-Tag: noindex som ekstra sikring mens indeksen tømmes.
 *
 * MERK: `/design-studio` står bevisst IKKE i lista. Den har en ekte
 * 308-redirect til `/` i next.config.ts fordi forsiden lå der før.
 * Middleware kjører før redirects – en 410 her ville drept redirecten.
 *
 * Når rutene en dag slettes fra `src/app/`, kan denne fila fjernes.
 */

const GONE = [
    // Alternative forsider fra malen
    "/business-consulting",
    "/corporate-agency",
    "/creative-agency",
    "/digital-agency",
    "/digital-marketing",
    "/hr-consulting",
    "/lawyer-agency",
    "/modern-agency",
    "/personal-portfolio",
    "/portfolio-creative-thumb",
    "/portfolio-interactive-hover",
    "/portfolio-webgl-showcase",
    "/shop-modern",
    "/startup-agency",
    // Om / team / karriere
    "/about",
    "/about-me",
    "/about-us",
    "/team",
    "/team-details",
    "/career",
    "/career-details",
    "/job-application-form",
    // Blogg-maler
    "/blog",
    "/blog-2",
    "/blog-details",
    "/blog-details-2",
    "/blog-sidebar",
    "/blog-sidebar-2",
    // Prosjekt-maler
    "/portfolio-skew-slider",
    "/project-details",
    "/project-details-2",
    "/project-full",
    "/project-list",
    "/project-mesonary",
    "/project-nogap",
    "/project-single",
    "/project-slider",
    "/project-three-column",
    "/project-two-column",
    // Tjeneste-maler
    "/service",
    "/service-2",
    "/service-3",
    "/service-details",
    // Nettbutikk
    "/cart",
    "/checkout",
    "/product-details",
    "/shop",
    // Innlogging
    "/login",
    "/register",
    // Kontakt-maler (skjemaet ligger på forsiden)
    "/contact-me",
    "/contact-us",
    // Diverse malsider
    "/pricing",
    "/faq",
    "/404",
];

const GONE_HTML = `<!doctype html>
<html lang="no"><head><meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Siden finnes ikke – Usett 3D Studio</title>
<style>
 body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
 background:#010103;color:#f5f7f5;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px}
 a{color:#F9A01B}
</style></head>
<body><div>
<h1 style="font-size:22px;font-weight:600;margin:0 0 10px">Denne siden finnes ikke</h1>
<p style="opacity:.75;margin:0 0 20px">Den ble fjernet da nettstedet ble bygget om.</p>
<p><a href="/">Gå til usett.no</a></p>
</div></body></html>`;

export function middleware(request: NextRequest) {
    // Normaliser: fjern etterfølgende skråstrek og gjør om til små bokstaver.
    const path =
        request.nextUrl.pathname.replace(/\/+$/, "").toLowerCase() || "/";

    const isGone = GONE.some((p) => path === p || path.startsWith(p + "/"));

    if (isGone) {
        return new NextResponse(GONE_HTML, {
            status: 410,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "X-Robots-Tag": "noindex, nofollow",
                "Cache-Control": "public, max-age=3600",
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    // Kjør ikke på statiske filer, bilder, API eller metadata-ruter.
    matcher: [
        "/((?!api|_next/static|_next/image|assets|hero|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml).*)",
    ],
};
