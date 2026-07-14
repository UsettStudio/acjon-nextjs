/**
 * Sentral SEO-/bedriftskonfig for Usett.
 * Brukes av metadata, JSON-LD (strukturert data), sitemap og robots.
 *
 * NB: Bytt SITE_URL til den endelige produksjons-URLen når domenet er live,
 * og fyll inn STREET_ADDRESS når adressen er klar (se address-feltet under).
 */

export const SITE_URL = "https://usett.no"; // TODO: bekreft endelig domene (med/uten www)

export const siteConfig = {
    name: "Usett",
    legalName: "Usett 3D Studio",
    shortName: "Usett",
    url: SITE_URL,
    // Kort, salgs-/søkeoptimalisert beskrivelse (brukes som default meta description)
    description:
        "Usett er et 3D-studio i Østfold som leverer fotorealistisk 3D-visualisering, interiør og eksteriør, foto- og dronemontasje, 3D-animasjon, 2D-plantegninger, 3D-skanning (Digital Twin) og hjemmesider. Vi betjener Fredrikstad, Sarpsborg, Moss og hele Østfold.",
    telephone: "+4792806558",
    telephoneDisplay: "+47 92 80 65 58",
    email: "Mikael@Usett.no",
    // Web3Forms access-key: hent på https://web3forms.com (skriv inn Mikael@Usett.no,
    // få nøkkelen på e-post) og lim inn her. Kontaktskjemaet sender da innsendinger
    // til den e-posten nøkkelen er knyttet til (Mikael@Usett.no). Trygg å ha i klientkode.
    web3formsAccessKey: "",
    address: {
        streetAddress: "Høvreveien 6",
        postalCode: "1712",
        addressLocality: "Grålum",
        addressRegion: "Østfold",
        addressCountry: "NO",
    },
    // Org-nummer – fylles inn når brukeren sender det (vises i footer + kan legges i JSON-LD).
    orgNumber: "", // TODO: legg inn org-nummer
    // Omtrentlig senterpunkt (Grålum, Sarpsborg) – kan finjusteres ved eksakt punkt.
    geo: { latitude: 59.2769, longitude: 11.0645 },
    areaServed: ["Fredrikstad", "Sarpsborg", "Moss", "Halden", "Østfold", "Norge"],
    priceRange: "24 000–53 500 kr",
    // Legg inn sosiale profiler her når de finnes (styrker E-E-A-T / kunnskapsgraf).
    sameAs: [] as string[],
    ogImage: "/assets/img/og/usett-og.jpg",
    locale: "nb_NO",
};

export type ServiceDef = {
    slug: string;
    name: string;
    description: string;
};

// Tjenester – navn + korte, faktabaserte beskrivelser (Norsk, geo-bevisst).
export const services: ServiceDef[] = [
    {
        slug: "3d-visualisering",
        name: "3D-visualisering",
        description:
            "Fotorealistisk 3D-visualisering og arkitekturvisualisering for bolig, næring og produkt i Østfold – ideelt for salg, markedsføring og prosjektering.",
    },
    {
        slug: "interiorvisualisering",
        name: "Interiørvisualisering",
        description:
            "3D-visualisering av interiør: leiligheter, boliger, hytter og næringslokaler med realistisk lys, materialer og møblering.",
    },
    {
        slug: "exteriorvisualisering",
        name: "Eksteriørvisualisering",
        description:
            "3D-visualisering av eksteriør og fasader – eneboliger, rekkehus og boligblokker satt inn i realistiske omgivelser.",
    },
    {
        slug: "foto-dronemontasje",
        name: "Foto- og dronemontasje",
        description:
            "Fotomontasje og dronemontasje: vi setter 3D-modellen inn i ekte foto eller dronebilder av tomten for troverdige før/etter-visualiseringer.",
    },
    {
        slug: "3d-animasjon",
        name: "3D-animasjon",
        description:
            "Fotorealistisk 3D-animasjon og fly-through-videoer som viser bygg og produkter i bevegelse.",
    },
    {
        slug: "2d-plantegninger",
        name: "2D-plantegninger",
        description:
            "Tydelige 2D-plantegninger og møblerte planløsninger for prospekt, søknad og salg.",
    },
    {
        slug: "3d-skanning",
        name: "3D-skanning (Digital Twin)",
        description:
            "3D-skanning og Digital Twin av bygg og lokaler i Østfold – nøyaktige punktskyer og 3D-modeller av eksisterende forhold.",
    },
    {
        slug: "hjemmesider",
        name: "Hjemmesider",
        description:
            "Moderne, raske hjemmesider og nettsider – med innebygd 3D og visualisering som skiller deg ut.",
    },
];

// Vanlige spørsmål – vises på siden OG legges som FAQPage-schema (bra for Google + AI-svar/GEO).
export const faqs: { q: string; a: string }[] = [
    {
        q: "Hva koster 3D-visualisering hos Usett?",
        a: "Vi tilbyr tre pakker: Basis fra 24 000 kr, Proff 39 000 kr og Komplett 53 500 kr. Endelig pris avhenger av antall bilder og kompleksitet, og du kan supplere med tilleggsvalg som 2D salgstegninger, AI-genererte sesongbilder og animasjon. Ta kontakt for et konkret tilbud.",
    },
    {
        q: "Hvilke områder i Østfold dekker dere?",
        a: "Vi holder til i Østfold og betjener Fredrikstad, Sarpsborg, Moss, Halden og resten av fylket. 3D-visualisering, animasjon og plantegninger leverer vi digitalt i hele Norge.",
    },
    {
        q: "Hvor lang tid tar en 3D-visualisering?",
        a: "Mange oppdrag leveres innen 48 timer. Større prosjekter med animasjon eller flere bilder avtales individuelt, men vi er kjent for rask levering.",
    },
    {
        q: "Hva er forskjellen på interiør- og eksteriørvisualisering?",
        a: "Interiørvisualisering viser rommene innvendig med lys, materialer og møblering, mens eksteriørvisualisering viser bygget utvendig – fasader og bygg satt inn i realistiske omgivelser.",
    },
    {
        q: "Tilbyr dere 3D-skanning og Digital Twin?",
        a: "Ja. Vi utfører 3D-skanning av bygg og lokaler i Østfold og lager nøyaktige 3D-modeller / Digital Twin av eksisterende forhold.",
    },
    {
        q: "Lager dere også dronefoto, fotomontasje og 2D-plantegninger?",
        a: "Ja. Vi tilbyr foto- og dronemontasje der 3D-modellen settes inn i ekte foto, samt tydelige 2D-plantegninger for prospekt og søknad.",
    },
    {
        q: "Lager dere hjemmesider?",
        a: "Ja. Vi lager moderne, raske hjemmesider – gjerne med innebygd 3D og visualisering som løfter presentasjonen av prosjektene dine.",
    },
];
