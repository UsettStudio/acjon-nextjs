import { SITE_URL, siteConfig, services, faqs } from "@/data/siteConfig";

/**
 * Strukturert data (JSON-LD) for Usett.
 * Gir Google rike resultater + hjelper AI/GEO (ChatGPT, Gemini, Perplexity) å
 * forstå og sitere hva Usett tilbyr, hvor, og til hvilken pris.
 *
 * @graph:
 *  - ProfessionalService (LocalBusiness) med tjenester, område og kontaktinfo
 *  - WebSite
 *  - FAQPage
 */
const StudioJsonLd = () => {
    const businessId = `${SITE_URL}/#usett`;

    const hasStreet = !!siteConfig.address.streetAddress;

    const business = {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": businessId,
        name: siteConfig.legalName,
        alternateName: siteConfig.name,
        url: SITE_URL,
        image: `${SITE_URL}${siteConfig.ogImage}`,
        logo: `${SITE_URL}/assets/img/logo/logo-black-v2.png`,
        description: siteConfig.description,
        telephone: siteConfig.telephone,
        email: siteConfig.email,
        priceRange: siteConfig.priceRange,
        // Norsk organisasjonsnummer – tas med i strukturert data når det er fylt inn.
        ...(siteConfig.orgNumber ? { taxID: siteConfig.orgNumber } : {}),
        address: {
            "@type": "PostalAddress",
            ...(hasStreet ? { streetAddress: siteConfig.address.streetAddress } : {}),
            ...(siteConfig.address.postalCode ? { postalCode: siteConfig.address.postalCode } : {}),
            addressLocality: siteConfig.address.addressLocality,
            addressRegion: siteConfig.address.addressRegion,
            addressCountry: siteConfig.address.addressCountry,
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: siteConfig.geo.latitude,
            longitude: siteConfig.geo.longitude,
        },
        areaServed: siteConfig.areaServed.map((name) => ({ "@type": "AdministrativeArea", name })),
        knowsAbout: [
            "3D-visualisering",
            "Arkitekturvisualisering",
            "Interiørvisualisering",
            "Eksteriørvisualisering",
            "3D-animasjon",
            "3D-skanning",
            "Digital Twin",
            "Fotomontasje",
            "Dronefoto",
            "2D-plantegninger",
        ],
        ...(siteConfig.sameAs.length ? { sameAs: siteConfig.sameAs } : {}),
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Tjenester",
            itemListElement: services.map((s) => ({
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: s.name,
                    description: s.description,
                    areaServed: "Østfold",
                    provider: { "@id": businessId },
                },
            })),
        },
    };

    const website = {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: siteConfig.legalName,
        inLanguage: "nb-NO",
        publisher: { "@id": businessId },
    };

    const faqPage = {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
    };

    const graph = {
        "@context": "https://schema.org",
        "@graph": [business, website, faqPage],
    };

    return (
        <script
            type="application/ld+json"
            // JSON-LD er trygt: vi serialiserer vår egen struktur (ingen brukerinput).
            dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
    );
};

export default StudioJsonLd;
