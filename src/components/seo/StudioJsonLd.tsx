import {
    SITE_URL,
    siteConfig,
    services,
    servicePages,
    pakker,
    tilleggsvalg,
    faqs,
} from "@/data/siteConfig";
import JsonLd from "./JsonLd";

/**
 * Strukturert data (JSON-LD) for Usett – ligger på forsiden.
 *
 * Hensikten er å gjøre tre ting maskinlesbare på én gang:
 *  1. HVEM Usett er – knyttet til et organisasjonsnummer, en adresse og en
 *     person, slik at en AI-modell kan skille studioet fra ordet «usett».
 *  2. HVA tjenestene koster – som Offer med tallpriser. En pris skrevet som
 *     «24 000 kr» i brødtekst kan ikke siteres som en pris av en maskin;
 *     price: 24000 + priceCurrency: "NOK" kan det.
 *  3. HVILKE SPØRSMÅL Usett svarer på – som FAQPage.
 *
 * @graph:
 *  - ProfessionalService / LocalBusiness med identitet, tjenester og pakker
 *  - Person (grunnlegger)
 *  - WebSite
 *  - FAQPage
 */
const StudioJsonLd = () => {
    const businessId = `${SITE_URL}/#usett`;
    const personId = `${SITE_URL}/#mikael`;

    const hasStreet = !!siteConfig.address.streetAddress;

    /** Riktig schema-type per område – «Norge» er et land, ikke et fylke. */
    const areaServed = siteConfig.areaServed.map((name) => {
        if (name === "Norge") return { "@type": "Country", name };
        if (name === "Østfold") return { "@type": "AdministrativeArea", name };
        return { "@type": "City", name };
    });

    /** Pakkene med tallpriser – dette er det som faktisk blir sitert. */
    const pakkeTilbud = pakker.map((p) => ({
        "@type": "Offer",
        "@id": `${SITE_URL}/priser#${p.id}`,
        name: p.name,
        description: p.description,
        price: p.price,
        priceCurrency: "NOK",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/priser`,
        itemOffered: {
            "@type": "Service",
            name: `3D-visualisering – pakke ${p.name}`,
            serviceType: "3D-visualisering",
            provider: { "@id": businessId },
        },
    }));

    const tilleggTilbud = tilleggsvalg.map((t) => ({
        "@type": "Offer",
        "@id": `${SITE_URL}/priser#${t.id}`,
        name: t.name,
        description: t.description,
        price: t.price,
        priceCurrency: "NOK",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/priser`,
        itemOffered: { "@type": "Service", name: t.name, provider: { "@id": businessId } },
    }));

    /** Tjenestene, hver med lenke til sin egen side. */
    const tjenesteTilbud = services.map((s) => {
        const page = servicePages.find((p) => p.slug === s.slug);
        return {
            "@type": "Offer",
            url: `${SITE_URL}/tjenester/${s.slug}`,
            ...(page?.priceFrom
                ? {
                      priceSpecification: {
                          "@type": "PriceSpecification",
                          minPrice: page.priceFrom,
                          priceCurrency: "NOK",
                      },
                  }
                : {}),
            itemOffered: {
                "@type": "Service",
                "@id": `${SITE_URL}/tjenester/${s.slug}#tjeneste`,
                name: s.name,
                description: s.description,
                serviceType: s.name,
                url: `${SITE_URL}/tjenester/${s.slug}`,
                areaServed: { "@type": "Country", name: "Norge" },
                provider: { "@id": businessId },
            },
        };
    });

    const person = {
        "@type": "Person",
        "@id": personId,
        name: siteConfig.founder.name,
        jobTitle: siteConfig.founder.jobTitle,
        worksFor: { "@id": businessId },
    };

    const business = {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": businessId,
        name: siteConfig.legalName,
        // Merkenavnet og det registrerte selskapsnavnet er begge navn folk og
        // maskiner kan møte. Begge må stå her for at kjeden skal henge sammen.
        alternateName: [siteConfig.name, siteConfig.registeredName],
        // Det juridiske navnet i Enhetsregisteret. Dette er leddet som knytter
        // «Usett» til en faktisk registrert virksomhet.
        legalName: siteConfig.registeredName,
        url: SITE_URL,
        image: `${SITE_URL}${siteConfig.ogImage}`,
        logo: `${SITE_URL}${siteConfig.logo}`,
        description: siteConfig.description,
        telephone: siteConfig.telephone,
        email: siteConfig.email,
        priceRange: siteConfig.priceRange,
        currenciesAccepted: "NOK",
        // Organisasjonsnummeret, både som taxID, som norsk MVA-ID og som
        // eksplisitt navngitt identifikator. Den siste er den mest entydige.
        taxID: siteConfig.orgNumberCompact,
        vatID: `NO${siteConfig.orgNumberCompact}MVA`,
        identifier: {
            "@type": "PropertyValue",
            name: "Organisasjonsnummer",
            value: siteConfig.orgNumberCompact,
        },
        ...(siteConfig.foundingDate ? { foundingDate: siteConfig.foundingDate } : {}),
        founder: { "@id": personId },
        employee: { "@id": personId },
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
        openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: siteConfig.openingHours.days,
            opens: siteConfig.openingHours.opens,
            closes: siteConfig.openingHours.closes,
        },
        areaServed,
        knowsAbout: [
            "3D-visualisering",
            "Arkitekturvisualisering",
            "Interiørvisualisering",
            "Eksteriørvisualisering",
            "3D-animasjon",
            "3D-skanning",
            "Digital Twin",
            "Fotogrammetri",
            "Fotomontasje",
            "Dronefoto",
            "2D-plantegninger",
            "Prosjektsider for boligprosjekter",
        ],
        ...(siteConfig.sameAs.length ? { sameAs: siteConfig.sameAs } : {}),
        makesOffer: [...pakkeTilbud, ...tilleggTilbud],
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Tjenester fra Usett",
            itemListElement: tjenesteTilbud,
        },
    };

    const website = {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: siteConfig.legalName,
        inLanguage: siteConfig.lang,
        publisher: { "@id": businessId },
    };

    const faqPage = {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        inLanguage: siteConfig.lang,
        mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
    };

    return (
        <JsonLd
            data={{
                "@context": "https://schema.org",
                "@graph": [business, person, website, faqPage],
            }}
        />
    );
};

export default StudioJsonLd;
