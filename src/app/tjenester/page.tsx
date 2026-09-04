import ContentStyles from "@/components/seo/ContentStyles";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL, siteConfig, servicePages } from "@/data/siteConfig";
import type { Metadata } from "next";
import Link from "next/link";

// Uten "Usett" til slutt – malen i layout.tsx legger på "| Usett" selv.
const TITLE = "Alle tjenester – hva Usett leverer";
const DESCRIPTION =
    "Oversikt over tjenestene fra Usett: 3D-visualisering, interiør og eksteriør, foto- og dronemontasje, 3D-animasjon, 2D-plantegninger, 3D-skanning og hjemmesider. Hver tjeneste med leveringstid og hva du får.";

export const metadata: Metadata = {
    title: { absolute: `${TITLE} | Usett` },
    description: DESCRIPTION,
    alternates: { canonical: "/tjenester" },
    openGraph: {
        type: "website",
        locale: siteConfig.locale,
        url: "/tjenester",
        siteName: siteConfig.legalName,
        title: TITLE,
        description: DESCRIPTION,
        images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "Usett 3D Studio" }],
    },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function TjenesterPage() {
    const graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": `${SITE_URL}/tjenester#side`,
                url: `${SITE_URL}/tjenester`,
                name: TITLE,
                description: DESCRIPTION,
                inLanguage: siteConfig.lang,
                isPartOf: { "@id": `${SITE_URL}/#website` },
                about: { "@id": `${SITE_URL}/#usett` },
                breadcrumb: { "@id": `${SITE_URL}/tjenester#brodsmuler` },
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${SITE_URL}/tjenester#brodsmuler`,
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Usett", item: SITE_URL },
                    { "@type": "ListItem", position: 2, name: "Tjenester" },
                ],
            },
            {
                "@type": "ItemList",
                "@id": `${SITE_URL}/tjenester#liste`,
                name: "Tjenester fra Usett",
                itemListElement: servicePages.map((s, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    name: s.name,
                    url: `${SITE_URL}/tjenester/${s.slug}`,
                })),
            },
        ],
    };

    return (
        <main className="usett-doc">
            <ContentStyles />
            <JsonLd data={graph} />

            <div className="doc-wide">
                <nav className="doc-crumbs" aria-label="Brødsmuler">
                    <Link href="/">Usett</Link>
                    <span>/</span>
                    Tjenester
                </nav>

                <h1>Tjenestene Usett leverer</h1>

                <p className="doc-answer">
                    Usett leverer fotorealistisk 3D-visualisering, interiør- og
                    eksteriørbilder, foto- og dronemontasje, 3D-animasjon,
                    2D-plantegninger, 3D-skanning med digital tvilling og
                    hjemmesider. Alt som lages digitalt leveres til hele Norge;
                    skanning og fotografering krever oppmøte og gjøres fast i
                    Østfold-området.
                </p>

                <div className="doc-links">
                    {servicePages.map((s) => (
                        <Link key={s.slug} className="doc-link" href={`/tjenester/${s.slug}`}>
                            <strong>{s.name}</strong>
                            <span>{s.description}</span>
                            {/* Ingen pris i kortene – prisene hører hjemme på
                                forsiden og /priser, ikke i tjenestenavigasjonen. */}
                            <em>Se tjenesten →</em>
                        </Link>
                    ))}
                </div>

                <div className="doc-cta">
                    <h2>Usikker på hva prosjektet ditt trenger?</h2>
                    <p>
                        Send plantegningene, så sier vi hva som gir mest igjen for
                        pengene – og hva som ikke er verdt å bruke penger på.
                    </p>
                    <a className="btn" href={`mailto:${siteConfig.email}`}>
                        {siteConfig.email}
                    </a>
                    <a className="btn" href={`tel:${siteConfig.telephone}`}>
                        {siteConfig.telephoneDisplay}
                    </a>
                </div>
            </div>
        </main>
    );
}
