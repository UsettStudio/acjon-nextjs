import { getPublishedSite, getPublishedUnitSlugs } from "@/features/site-builder/render-data";
import { publicEnv } from "@/lib/env";
import { siteUrl } from "@/features/site-builder/site";

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/** Sitemap for prosjektsiden: alle publiserte sider og synlige enheter. */
export async function GET(_request: Request, { params }: RouteContext<"/sites/[site]/sitemap.xml">) {
  const { site: key } = await params;
  const site = await getPublishedSite(decodeURIComponent(key));
  if (!site) {
    return new Response("Ikke funnet", { status: 404 });
  }
  const env = publicEnv();
  const base = siteUrl(site.subdomain, site.primaryHostname, env.platformDomain, env.appUrl);
  const slugs = await getPublishedUnitSlugs(site.project.id);
  const urls = [
    ...site.pages.map((page) => (page.isHome ? `${base}/` : `${base}/${page.slug}`)),
    ...slugs.map((slug) => `${base}/bolig/${encodeURIComponent(slug)}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
