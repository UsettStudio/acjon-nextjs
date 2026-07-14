import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return [
        {
            url: `${SITE_URL}/design-studio`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/project-three-column`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
    ];
}
