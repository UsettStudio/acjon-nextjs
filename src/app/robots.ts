import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/siteConfig";

/**
 * robots.txt
 *
 * `User-agent: *` dekker AI-crawlerne teknisk sett allerede, men de er navngitt
 * eksplisitt her av to grunner: det fjerner enhver tvil om at de er velkomne,
 * og det gir ett sted å styre dem fra dersom noen av dem en dag skal stenges ute.
 *
 * Den viktigste linjen i hele fila er OAI-SearchBot. Den bygger indeksen
 * ChatGPT Search siterer fra – blokkeres den, forsvinner Usett fra ChatGPT
 * selv om siden rangerer godt i vanlig søk.
 */

/** Crawlere som skal ha full tilgang, med begrunnelse der den ikke er åpenbar. */
const AI_CRAWLERS = [
    // OpenAI
    "OAI-SearchBot",   // bygger ChatGPT Search-indeksen – den viktigste
    "ChatGPT-User",    // henter en side i sanntid når en bruker ber om det
    "GPTBot",          // modelltrening: lar modellen selv «kjenne» Usett
    // Anthropic
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    // Google – styrer bruk i Gemini og AI Overviews, uavhengig av vanlig ranking
    "Google-Extended",
    // Øvrige
    "PerplexityBot",
    "Perplexity-User",
    "Applebot",
    "Applebot-Extended",
    "Amazonbot",
    "meta-externalagent",
    "CCBot",
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            { userAgent: "Googlebot", allow: "/", disallow: ["/api/"] },
            { userAgent: "Bingbot", allow: "/", disallow: ["/api/"] },
            ...AI_CRAWLERS.map((userAgent) => ({
                userAgent,
                allow: "/",
                disallow: ["/api/"],
            })),
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
