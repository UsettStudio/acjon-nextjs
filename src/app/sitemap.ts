import type { MetadataRoute } from "next";
import { SITE_URL, staticRoutes, servicePages } from "@/data/siteConfig";

/**
 * sitemap.xml – genereres fra rutelista i siteConfig.
 *
 * Nye sider legges til i `staticRoutes` (eller i `servicePages` for tjenester),
 * så havner de her automatisk. Det er poenget med å ha én kilde: et sitemap
 * som glipper for nye sider er verre enn ingen, fordi Search Console rapporterer
 * grønt mens sidene aldri blir oppdaget.
 *
 * Personvernsiden ligger bevisst med lav prioritet, men SKAL være med: Meta og
 * Google ser etter en tilgjengelig personvernside når man kjører annonser.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const statiske = staticRoutes.map((r) => ({
        url: r.path === "/" ? SITE_URL : `${SITE_URL}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
    }));

    const tjenester = servicePages.map((s) => ({
        url: `${SITE_URL}/tjenester/${s.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }));

    return [...statiske, ...tjenester];
}
