import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return [
        {
            url: SITE_URL,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 1.0,
        },
        {
            // Personvernerklæringen. Lav prioritet, endres sjelden – men den
            // BØR ligge i sitemapet: Meta og Google ser etter en tilgjengelig
            // personvernside når man kjører annonser og hurtigskjemaer.
            url: `${SITE_URL}/personvern`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];
}
