import { getPublishedSite } from "@/features/site-builder/render-data";
import { siteUrl } from "@/features/site-builder/site";
import { publicEnv } from "@/lib/env";

/** robots.txt for prosjektsiden. Alt kan indekseres, og sitemap ligger på samme vertsnavn. */
export async function GET(_request: Request, { params }: RouteContext<"/sites/[site]/robots.txt">) {
  const { site: key } = await params;
  const site = await getPublishedSite(decodeURIComponent(key));
  if (!site) {
    return new Response("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const env = publicEnv();
  const base = siteUrl(site.subdomain, site.primaryHostname, env.platformDomain, env.appUrl);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
