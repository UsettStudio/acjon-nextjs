import type { MetadataRoute } from "next";

/** Admin skal ikke indekseres. Publiserte prosjektsider har egen robots.txt (app/sites/[site]/robots.txt). */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
