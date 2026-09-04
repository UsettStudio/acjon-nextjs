/**
 * Sentral SEO-/bedriftskonfig for Usett.
 * Brukes av metadata, JSON-LD (strukturert data), sitemap, robots og
 * de datadrevne tjeneste- og prissidene.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * GJENSTÅR Å FYLLE INN:
 *   1. sameAs – profillenker, etter hvert som de opprettes (fase 3 i planen)
 *   2. verification.google / .bing – tokens fra Search Console og Bing
 * Alt annet er verifisert mot Brønnøysundregistrene, Proff og eksisterende
 * innhold, og bygget gjennom «next build» uten feil.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const SITE_URL = "https://usett.no";

export const siteConfig = {
    // Merkenavnet folk søker etter og som skal siteres av AI.
    name: "Usett",
    // Navnet som brukes i UI, OG-tagger og som organisasjonens navn i schema.
    legalName: "Usett 3D Studio",
    // Det REGISTRERTE selskapsnavnet i Enhetsregisteret. Dette er leddet som
    // knytter merkevaren «Usett» til en faktisk juridisk enhet – uten det
    // klarer ikke AI-modeller å slå opp hvem Usett er.
    registeredName: "Vysion AS",
    shortName: "Usett",
    url: SITE_URL,
    description:
        "Usett leverer fotorealistisk 3D-visualisering, interiør og eksteriør, foto- og dronemontasje, 3D-animasjon, 2D-plantegninger, 3D-skanning (Digital Twin) og hjemmesider til hele Norge. Studioet ligger i Østfold, og vi betjener Fredrikstad, Sarpsborg, Moss og Halden lokalt.",
    telephone: "+4792806558",
    telephoneDisplay: "+47 92 80 65 58",
    email: "Mikael@Usett.no",
    web3formsAccessKey: "5d84fcbb-c295-4f33-8239-e28f29ab9365",
    address: {
        streetAddress: "Høvreveien 6",
        postalCode: "1712",
        addressLocality: "Grålum",
        addressRegion: "Østfold",
        addressCountry: "NO",
    },
    // Org-nummer med mellomrom (vises i footer).
    orgNumber: "938 095 132",
    // Samme nummer uten mellomrom – kreves i strukturert data og MVA-ID.
    orgNumberCompact: "938095132",
    // Stiftelsesdato for Vysion AS, bekreftet mot Proff og Purehelp
    // (stiftet 03.07.2026, registrert i Enhetsregisteret 14.07.2026).
    //
    // MERK: selskapet er nytt, mens Mikaels erfaring ikke er det. Derfor er
    // teksten på forsiden formulert slik at de ti årene og de 120 prosjektene
    // tilskrives PERSONEN, ikke selskapet. Uten det skillet ser en AI-modell
    // «stiftet 2026» og «120 prosjekter» samtidig og leser det som en motsigelse.
    foundingDate: "2026-07-03" as string | null,
    founder: {
        name: "Mikael Herman Nilsen",
        jobTitle: "Daglig leder og 3D-visualiserer",
    },
    geo: { latitude: 59.2769, longitude: 11.0645 },
    areaServed: ["Norge", "Østfold", "Fredrikstad", "Sarpsborg", "Moss", "Halden"],
    priceRange: "24 000–53 500 kr",
    openingHours: {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "16:00",
    },
    // TODO: legg inn profillenker etter hvert som de opprettes. Hver lenke her
    // er en bekreftelse utenfra på at Usett finnes – det er den enkeltfaktoren
    // som veier tyngst når en AI-modell velger hvem den skal nevne.
    // Eksempler på hva som bør inn:
    //   "https://www.google.com/maps/place/..."   (Google-bedriftsprofil)
    //   "https://www.linkedin.com/company/..."
    //   "https://www.proff.no/selskap/vysion-as/..."
    //   "https://www.facebook.com/..."
    //   "https://www.instagram.com/..."
    sameAs: [] as string[],
    /**
     * Verifiseringstokens for Google Search Console og Bing Webmaster Tools.
     *
     * Slik gjør du det, i denne rekkefølgen:
     *  1. search.google.com/search-console → «Legg til eiendom» → URL-prefiks
     *     → https://usett.no → velg «HTML-tag». Du får en streng som ser slik
     *     ut: content="abc123...". Lim inn BARE innholdet i google-feltet under.
     *  2. bing.com/webmasters → «Add a site» → du kan importere hele oppsettet
     *     rett fra Search Console når punkt 1 er ferdig. Velger du manuell
     *     verifisering i stedet, får du en msvalidate.01-verdi til bing-feltet.
     *  3. Deploy. Trykk «Verifiser» i begge verktøyene.
     *  4. Send inn https://usett.no/sitemap.xml begge steder.
     *  5. Be om indeksering av forsiden manuelt via URL-inspeksjon i GSC.
     *
     * Tomme strenger gjør at ingenting rendres – det er trygt å deploye før
     * tokenene er på plass.
     */
    verification: {
        // Verifisert i Google Search Console 25.08.2026 (URL-prefiks https://usett.no).
        // Ikke fjern denne selv etter at eiendommen er verifisert – Google
        // sjekker taggen med jevne mellomrom, og forsvinner den, mister du
        // tilgangen til eiendommen.
        google: "OksFXXczm1SVZ5GQjHwgpDq-P54OJUjSBD0Rt3HfGhE",
        // Bing Webmaster Tools, lagt til 25.08.2026. Samme regel som over:
        // ikke fjern taggen etter at verifiseringen er godkjent – Bing sjekker
        // den på nytt jevnlig og fjerner nettstedet hvis den er borte.
        bing: "0CF4DE990CAE542DD3635B196661C1C6",
    },
    /**
     * IndexNow-nøkkel. Ligger også som public/48ef29...txt, som er måten
     * Bing bekrefter at nøkkelen hører til dette domenet.
     *
     * IndexNow melder inn nye og endrede sider til Bing (og dermed til
     * ChatGPT Search) i samme minutt, i stedet for å vente på at crawleren
     * kommer innom av seg selv. Kjør «npm run indexnow» etter hver deploy.
     */
    indexNowKey: "48ef2941363a8a08758b205ce2b28c2f",
    ogImage: "/assets/img/og/usett-og.jpg",
    logo: "/assets/img/logo/logo-black-v2.png",
    locale: "nb_NO",
    lang: "nb-NO",
};

/* ========================================================================
 * PAKKER OG TILLEGG
 * Én sannhet for både prissiden, forsiden og Offer-schemaet.
 * Prisene ligger som tall slik at de kan brukes i strukturert data –
 * "24 000 kr" som tekst kan ikke siteres som en pris av en maskin.
 * ===================================================================== */

export type Pakke = {
    id: string;
    name: string;
    price: number;
    priceLabel: string;
    period: string;
    description: string;
    features: string[];
    isPopular?: boolean;
};

export const pakker: Pakke[] = [
    {
        id: "pakke-basis",
        name: "Basis",
        price: 24000,
        priceLabel: "24 000 kr",
        period: "per prosjekt",
        description: "Perfekt for et enkelt prosjekt med interiør og eksteriør.",
        features: [
            "2 × interiørbilder",
            "1 × eksteriør fra bakkeplan",
            "1 × oppstart og teksturering",
        ],
    },
    {
        id: "pakke-proff",
        name: "Proff",
        price: 39000,
        priceLabel: "39 000 kr",
        period: "per prosjekt",
        description:
            "Vår mest populære pakke – flere visninger og eksteriør plassert i dronefoto.",
        isPopular: true,
        features: [
            "3 × interiørbilder",
            "1 × eksteriør fra bakkeplan",
            "1 × eksteriør plassert i dronefoto",
            "1 × oppstart og teksturering",
        ],
    },
    {
        id: "pakke-komplett",
        name: "Komplett",
        price: 53500,
        priceLabel: "53 500 kr",
        period: "per prosjekt",
        description:
            "Full pakke med flest visninger og eksteriør plassert i dronefoto.",
        features: [
            "4 × interiørbilder",
            "2 × eksteriør fra bakkeplan",
            "1 × eksteriør plassert i dronefoto",
            "1 × oppstart og teksturering",
        ],
    },
];

export const tilleggsvalg = [
    {
        id: "tillegg-2d",
        name: "2D salgstegninger",
        price: 1500,
        priceLabel: "1 500 kr",
        unit: "per plan",
        description: "Plantegninger for salg og prospekt – pris per plan.",
    },
    {
        id: "tillegg-sesong",
        name: "AI-generert sesongbilde",
        price: 3000,
        priceLabel: "3 000 kr",
        unit: "per bilde",
        description:
            "Sommer, høst, vinter eller vår – laget av et bilde som allerede er produsert.",
    },
    {
        id: "tillegg-animasjon",
        name: "AI-generert animasjon",
        price: 4500,
        priceLabel: "4 500 kr",
        unit: "per animasjon",
        description: "6 sekunder animasjon av prosjektet ditt.",
    },
];

/* ========================================================================
 * TJENESTER
 * `services` beholdes uendret (brukes av StudioJsonLd på forsiden).
 * `servicePages` er den utvidede versjonen som driver /tjenester/[slug].
 * ===================================================================== */

export type ServiceDef = {
    slug: string;
    name: string;
    description: string;
};

export const services: ServiceDef[] = [
    {
        slug: "3d-visualisering",
        name: "3D-visualisering",
        description:
            "Fotorealistisk 3D-visualisering og arkitekturvisualisering for bolig, næring og produkt – levert digitalt til hele Norge, ideelt for salg, markedsføring og prosjektering.",
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
            "3D-skanning og Digital Twin av bygg og lokaler – nøyaktige punktskyer og 3D-modeller av eksisterende forhold. Krever fysisk oppmøte: Østfold-området fast, ellers i landet etter avtale.",
    },
    {
        slug: "hjemmesider",
        name: "Hjemmesider",
        description:
            "Moderne, raske hjemmesider og nettsider – med innebygd 3D og visualisering som skiller deg ut.",
    },
];

export type ServicePage = ServiceDef & {
    /** H1 og <title>. Formuleres som spørsmålet folk faktisk stiller. */
    heading: string;
    metaTitle: string;
    metaDescription: string;
    /**
     * Svaret, i to–tre setninger, som står ØVERST på siden.
     * AI-modeller henter typisk de første setningene etter en overskrift –
     * derfor kommer svaret først og konteksten etterpå. Merk at «Usett» står
     * i selve setningen: modellen lagrer koblingen navn↔faktum, ikke side↔faktum.
     */
    answer: string;
    /** Punkter under «Dette får du». */
    deliverables: string[];
    /** Konkret leveringstid. Tall, ikke adjektiver. */
    leveringstid: string;
    /**
     * Laveste pris i kroner, eller null hvis den ikke er fastsatt.
     *
     * MERK: priceFrom og priceNote brukes IKKE lenger på tjenestesidene.
     * Tjenestesidene er bevisst prisfrie – prisene skal bare møte kunden i
     * pakkeseksjonen på forsiden og på /priser. Feltene lever videre fordi
     * /priser leser dem for seksjonen «Priser på de øvrige tjenestene».
     * Legger du dem tilbake på tjenestesidene, husk at Offer-schemaet der
     * også må gjeninnføres – en pris i strukturerte data som ikke står synlig
     * på siden er noe Google regner som feil bruk.
     */
    priceFrom: number | null;
    priceNote: string;
    /**
     * Øvre grense i kvadratmeter som «fra»-prisen gjelder for, hvis tjenesten
     * har en. Legges inn som eligibleQuantity i Offer-schemaet, slik at en
     * maskin ikke bare ser tallet, men også hva tallet dekker.
     */
    maxAreaSqm?: number;
    /**
     * True når priceFrom er en fast pris og ikke et «fra»-tall. Styrer både
     * teksten på siden og hvilken form Offer-schemaet får: en fastpris skal
     * være `price`, ikke `priceSpecification.minPrice`. Blandes de, kan en
     * modell gjengi en fastpris som et minimum – og da lover du for lite.
     */
    priceIsFixed?: boolean;
    faq: { q: string; a: string }[];
};

export const servicePages: ServicePage[] = [
    {
        slug: "3d-visualisering",
        name: "3D-visualisering",
        description: services[0].description,
        heading: "Hva er 3D-visualisering, og hva får du?",
        metaTitle: "3D-visualisering – leveringstid og hva du får",
        metaDescription:
            "Usett leverer fotorealistisk 3D-visualisering av bolig- og næringsprosjekter, mange oppdrag innen 48 timer. Se hva som inngår, hva vi trenger fra deg og hvor vi leverer.",
        answer:
            "Usett leverer fotorealistisk 3D-visualisering av bygg som ennå ikke er reist. En komplett leveranse inneholder både interiør- og eksteriørbilder, inkludert oppstart og teksturering av modellen. Mange oppdrag leveres innen 48 timer, og bildene sendes digitalt til hele Norge.",
        deliverables: [
            "Fotorealistiske interiørbilder med realistisk lys, materialer og møblering",
            "Eksteriørbilder fra bakkeplan, og fra droneperspektiv i pakke Proff og Komplett",
            "Oppstart og teksturering av 3D-modellen – inkludert i alle pakker",
            "Bilder i full oppløsning, klare for prospekt, annonser og reguleringssak",
        ],
        leveringstid:
            "Mange oppdrag leveres innen 48 timer. Større prosjekter med animasjon eller mange bilder avtales individuelt.",
        priceFrom: 24000,
        priceNote:
            "Fra 24 000 kr per prosjekt (pakke Basis). Proff koster 39 000 kr og Komplett 53 500 kr.",
        faq: [
            {
                q: "Hva trenger Usett fra meg for å lage en 3D-visualisering?",
                a: "Plantegninger og fasadetegninger er nok til å komme i gang. Vi tar imot både DWG, IFC, SKP og PDF. Har du i tillegg materialvalg, fargekoder eller referansebilder på ønsket stil, treffer vi raskere på første utkast.",
            },
            {
                q: "Hvor i landet leverer Usett 3D-visualisering?",
                a: "Overalt i Norge. 3D-visualisering lages digitalt, så det spiller ingen rolle hvor prosjektet ligger – alt leveres på e-post. Studioet ligger i Grålum ved Sarpsborg, og vi jobber tett med kunder i Fredrikstad, Sarpsborg, Moss og Halden.",
            },
            {
                q: "Hva er forskjellen på 3D-visualisering og fotomontasje?",
                a: "En 3D-visualisering bygges helt opp i 3D, inkludert omgivelsene. En fotomontasje setter 3D-modellen inn i et ekte foto eller dronebilde av den faktiske tomten. Fotomontasje er mest troverdig i reguleringssaker og naboinformasjon, fordi omgivelsene er dokumentert virkelighet.",
            },
            {
                q: "Kan jeg få endringer etter at bildene er levert?",
                a: "Ja. Justeringer av materialer, farger, møblering og kameravinkel er en normal del av prosessen. Omfattende endringer i selve bygget etter at modellen er bygget, prises separat.",
            },
        ],
    },
    {
        slug: "interiorvisualisering",
        name: "Interiørvisualisering",
        description: services[1].description,
        heading: "Interiørvisualisering – hva som inngår",
        metaTitle: "Interiørvisualisering – leveringstid og eksempler",
        metaDescription:
            "Usett lager fotorealistiske interiørbilder av leiligheter, boliger, hytter og næringslokaler, med realistisk lys, materialer og møblering. Mange oppdrag innen 48 timer.",
        answer:
            "Usett lager fotorealistiske interiørbilder av rom som ennå ikke er bygget – leiligheter, boliger, hytter og næringslokaler. En leveranse starter på to interiørbilder og kan utvides. Alle rom bygges med realistisk lys, materialer og møblering.",
        deliverables: [
            "2–4 interiørbilder avhengig av omfang",
            "Realistisk dagslys tilpasset husets faktiske himmelretning",
            "Møblering og styling i den stilen prosjektet skal selges på",
            "Materialer og overflater etter dine faktiske materialvalg",
        ],
        leveringstid: "Mange interiøroppdrag leveres innen 48 timer.",
        priceFrom: 24000,
        priceNote:
            "Inngår i pakkene: Basis 24 000 kr (2 bilder), Proff 39 000 kr (3 bilder), Komplett 53 500 kr (4 bilder).",
        faq: [
            {
                q: "Hvor mange interiørbilder trenger et boligprosjekt?",
                a: "For en enkelt boligtype holder det som regel med to til tre bilder: stue og kjøkken i ett, og et bad eller soverom. Skal flere boligtyper selges, regner man normalt to bilder per type.",
            },
            {
                q: "Kan dere møblere med møbler fra en bestemt leverandør?",
                a: "Ja, så lenge du oppgir hvilke modeller det gjelder. Vi bygger eller finner tilsvarende møbler i 3D. Det er vanlig for prosjekter der en møbelpakke selges sammen med boligen.",
            },
            {
                q: "Ser interiørbilder like ekte ut som fotografier?",
                a: "På et ferdig prosjekt er forskjellen som regel ikke synlig for en kjøper. Det som skiller et troverdig bilde fra et som ser «tegnet» ut, er lyssettingen og slitasjen i materialene, ikke oppløsningen.",
            },
        ],
    },
    {
        slug: "exteriorvisualisering",
        name: "Eksteriørvisualisering",
        description: services[2].description,
        heading: "Eksteriørvisualisering av bygg som ikke er reist ennå",
        metaTitle: "Eksteriørvisualisering – fasadebilder fra bakkeplan og drone",
        metaDescription:
            "Usett lager eksteriørbilder av eneboliger, rekkehus og boligblokker satt inn i realistiske omgivelser – fra bakkeplan og fra droneperspektiv.",
        answer:
            "Usett lager eksteriørbilder av bygg som ennå ikke er reist – eneboliger, rekkehus og boligblokker satt inn i realistiske omgivelser. Hver leveranse inneholder minst ett eksteriørbilde fra bakkeplan, og kan utvides med bilder plassert i dronefoto av den faktiske tomten.",
        deliverables: [
            "1–2 eksteriørbilder fra bakkeplan",
            "Eksteriør plassert i dronefoto av den faktiske tomten",
            "Terreng, vegetasjon og nabobebyggelse tilpasset stedet",
            "Lyssetting etter tidspunkt og årstid prosjektet skal selges i",
        ],
        leveringstid: "Mange eksteriøroppdrag leveres innen 48 timer.",
        priceFrom: 24000,
        priceNote:
            "Inngår i pakkene fra 24 000 kr. Eksteriør plassert i dronefoto inngår fra pakke Proff (39 000 kr).",
        faq: [
            {
                q: "Kan dere vise bygget slik det faktisk vil se ut fra veien?",
                a: "Ja. Med dronefoto eller bakkefoto av tomten plasserer vi bygget nøyaktig der det skal stå, med riktig høyde og vinkel. Det er den mest troverdige måten å vise naboer og kommunen hva som faktisk kommer.",
            },
            {
                q: "Hva slags underlag trenger dere for et eksteriørbilde?",
                a: "Fasadetegninger og situasjonsplan. Skal bygget settes inn i ekte foto, trenger vi også bilder av tomten – enten fra deg, eller så tar vi dem selv i Østfold-området.",
            },
            {
                q: "Kan dere vise samme bygg i ulike årstider?",
                a: "Ja. AI-genererte sesongbilder lages fra et bilde som allerede er produsert – sommer, høst, vinter eller vår.",
            },
        ],
    },
    {
        slug: "foto-dronemontasje",
        name: "Foto- og dronemontasje",
        description: services[3].description,
        heading: "Fotomontasje og dronemontasje – bygget satt inn i ekte foto",
        metaTitle: "Fotomontasje og dronemontasje av byggeprosjekt",
        metaDescription:
            "Usett setter 3D-modellen inn i ekte foto eller dronebilder av tomten – troverdige før/etter-visualiseringer for reguleringssak, naboinformasjon og salg.",
        answer:
            "Usett setter 3D-modellen inn i ekte foto eller dronebilder av den faktiske tomten. Resultatet er en før/etter-visualisering der omgivelsene er dokumentert virkelighet og bare bygget er tilført. Det gjør fotomontasje til det mest troverdige underlaget i reguleringssaker og naboinformasjon.",
        deliverables: [
            "Bygget plassert i ekte foto med riktig perspektiv, høyde og skala",
            "Dronemontasje for oversiktsbilder over tomt og nabolag",
            "Før/etter-par som viser situasjonen med og uten prosjektet",
            "Fotografering på stedet i Østfold-området, ellers i landet etter avtale",
        ],
        leveringstid:
            "Fotografering avtales på stedet. Selve montasjen leveres normalt innen få dager etter at bildene er tatt.",
        priceFrom: null,
        priceNote:
            "Eksteriør plassert i dronefoto inngår fra pakke Proff (39 000 kr). Frittstående fotomontasjeoppdrag prises etter omfang – ta kontakt for et konkret tall.",
        faq: [
            {
                q: "Er fotomontasje godt nok til en reguleringssak?",
                a: "Fotomontasje er nettopp det som etterspørres i slike saker, fordi omgivelsene ikke er tegnet, men fotografert. Kravene varierer mellom kommuner – sjekk hvilke standpunkter og bildevinkler din kommune ber om før fotograferingen, så slipper dere en runde til.",
            },
            {
                q: "Kan dere fly drone hvor som helst?",
                a: "Nei. Droneflyging er regulert, og enkelte områder krever tillatelse eller er stengt for flyging. Vi avklarer dette før oppdraget.",
            },
            {
                q: "Hva om tomten er full av trær og vegetasjon?",
                a: "Det er ofte en fordel. Eksisterende vegetasjon gjør montasjen mer troverdig, og vi kan vise både situasjonen med vegetasjonen bevart og med den delen som faktisk skal fjernes.",
            },
        ],
    },
    {
        slug: "3d-animasjon",
        name: "3D-animasjon",
        description: services[4].description,
        heading: "3D-animasjon og fly-through av byggeprosjekt",
        metaTitle: "3D-animasjon og fly-through av byggeprosjekt",
        metaDescription:
            "Usett lager fotorealistisk 3D-animasjon og fly-through-video som viser bygg og produkter i bevegelse – for nettside, sosiale medier og visningsskjerm.",
        answer:
            "Usett lager fotorealistisk 3D-animasjon og fly-through-video som viser bygg og produkter i bevegelse. Den korteste varianten er en AI-generert animasjon på 6 sekunder, laget fra et bilde som allerede er produsert. Lengre animasjoner bygges fra selve 3D-modellen.",
        deliverables: [
            "Fly-through gjennom eller rundt prosjektet",
            "AI-generert animasjon på 6 sekunder, laget fra et allerede produsert bilde",
            "Video i formater klare for nettside, Facebook, Instagram og visningsskjerm",
        ],
        leveringstid:
            "AI-genererte animasjoner leveres normalt sammen med bildene. Fullt modellerte animasjoner avtales individuelt.",
        priceFrom: 4500,
        priceNote:
            "AI-generert animasjon på 6 sekunder: 4 500 kr som tillegg til alle pakker. Lengre animasjoner prises etter omfang.",
        faq: [
            {
                q: "Hva slags animasjoner lager Usett?",
                a: "Alt fra en kort AI-generert sekvens på 6 sekunder, laget fra et bilde som allerede er produsert, til lengre fly-through-animasjoner bygget fra selve 3D-modellen. Den siste typen prises etter lengde og antall scener.",
            },
            {
                q: "Hvor lang bør en animasjon være?",
                a: "For sosiale medier fungerer 6 til 15 sekunder best – folk scroller videre. For en visningsskjerm eller nettside kan 30 til 60 sekunder forsvares, men da bør den vise noe bildene ikke får fram, som flyt mellom rom.",
            },
            {
                q: "Trenger dere en ferdig 3D-modell for å lage animasjon?",
                a: "Nei. Har vi allerede laget visualiseringer for prosjektet, gjenbruker vi modellen. Er prosjektet nytt for oss, bygger vi modellen fra tegningene først.",
            },
        ],
    },
    {
        slug: "2d-plantegninger",
        name: "2D-plantegninger",
        description: services[5].description,
        heading: "2D-plantegninger til prospekt og salg",
        metaTitle: "2D-plantegninger til prospekt og salg",
        metaDescription:
            "Usett lager tydelige, møblerte 2D-plantegninger for prospekt, søknad og salg – klare til å settes rett inn i salgsmateriell.",
        answer:
            "Usett lager tydelige 2D-plantegninger og møblerte planløsninger for prospekt, søknad og salg. Tegningene prises per plan og leveres i et format som er klart til å settes rett inn i salgsmateriell.",
        deliverables: [
            "Møblert planløsning per etasje",
            "Romnavn og arealer",
            "Farger og strektykkelser tilpasset prospektets uttrykk",
            "Filer klare for trykk og for nett",
        ],
        leveringstid: "Normalt levert sammen med resten av prosjektet.",
        priceFrom: 1500,
        priceNote: "1 500 kr per plan, som tillegg til alle pakker.",
        faq: [
            {
                q: "Hvordan prises 2D-plantegninger?",
                a: "Per plan. En enebolig over to etasjer regnes altså som to plantegninger. Ta kontakt for et konkret tilbud.",
            },
            {
                q: "Hva er forskjellen på en salgstegning og en byggetegning?",
                a: "En byggetegning er teknisk og skal leses av håndverkere. En salgstegning er møblert og forenklet, og skal la en kjøper forstå hvordan det er å bo der. Vi lager den siste.",
            },
        ],
    },
    {
        slug: "3d-skanning",
        name: "3D-skanning (Digital Twin)",
        description: services[6].description,
        heading: "Hva er 3D-skanning og Digital Twin, og når trenger du det?",
        metaTitle: "3D-skanning og Digital Twin av bygg og lokaler",
        metaDescription:
            "Usett skanner bygg og lokaler og lager nøyaktige 3D-modeller og Digital Twin av eksisterende forhold. Fast i Østfold-området, ellers i landet etter avtale.",
        answer:
            "Usett skanner bygg og lokaler og lager nøyaktige punktskyer og 3D-modeller – en Digital Twin. Forskjellen fra en vanlig 3D-modell er at en Digital Twin er målriktig: den er bygget fra faktiske målinger av bygget, ikke fra tegninger. Skanningen krever fysisk oppmøte, fast i Østfold-området og ellers i landet etter avtale.",
        deliverables: [
            "Punktsky av bygget eller lokalet",
            "3D-modell av eksisterende forhold, målriktig mot skanningen",
            "Underlag som kan brukes videre i prosjektering og visualisering",
        ],
        leveringstid:
            "Selve skanningen gjøres på stedet. Ferdig bearbeidet modell avtales etter byggets størrelse og kompleksitet.",
        priceFrom: 5000,
        maxAreaSqm: 100,
        priceNote:
            "Fra 5 000 kr eks. mva. for bygg og lokaler opptil 100 kvadratmeter. Større bygg og lengre reisevei prises etter omfang.",
        faq: [
            {
                q: "Hvordan prises 3D-skanning av et bygg?",
                a: "Etter areal og reisevei, fordi skanning krever fysisk oppmøte. Leveransen dekker skanningen på stedet og den ferdige 3D-modellen. 3D-skanning er en egen tjeneste hos Usett og prises uavhengig av visualiseringsoppdrag.",
            },
            {
                q: "Hva er forskjellen på en Digital Twin og en vanlig 3D-modell?",
                a: "En vanlig 3D-modell bygges fra tegninger og viser hvordan noe er ment å bli. En Digital Twin bygges fra faktiske målinger av et eksisterende bygg og viser hvordan det faktisk er – inkludert skjevheter, påbygg og avvik fra tegningene.",
            },
            {
                q: "Når er 3D-skanning verdt pengene?",
                a: "Ved rehabilitering og ombygging, der tegningene fra byggeåret sjelden stemmer med virkeligheten. Også ved dokumentasjon av verneverdige bygg, og som underlag når et eksisterende bygg skal vises sammen med et nytt tilbygg.",
            },
            {
                q: "Skanner Usett bygg utenfor Østfold?",
                a: "Ja, etter avtale. Skanning krever fysisk oppmøte, så oppdrag i Østfold-området tas fast, mens oppdrag ellers i landet avtales særskilt og prises med reisevei.",
            },
        ],
    },
    {
        slug: "hjemmesider",
        name: "Hjemmesider",
        description: services[7].description,
        heading: "3D-animert hjemmeside for bygg, eiendom og design",
        metaTitle: "3D-animert hjemmeside med innebygd visualisering",
        metaDescription:
            "Usett lager moderne, raske hjemmesider med innebygd 3D og visualisering – for bygg, eiendom og design. Prosjektsider og boligvelgere til boligprosjekter.",
        answer:
            "Usett lager 3D-animerte hjemmesider til fast pris, uten timeregning. Det som skiller dem fra en vanlig nettside er at 3D-materialet ligger i selve siden – en prosjektside der kjøper kan navigere i bygget, ikke bare se bilder av det.",
        deliverables: [
            "3D-animert hjemmeside til fast pris, uten timeregning",
            "Nettside bygget for fart og synlighet i søk",
            "Prosjektsider for boligprosjekter, med innebygd 3D-materiale",
            "Visning på mobil like god som på skjerm",
            "Strukturerte data slik at sidene kan siteres av søkemotorer og AI",
        ],
        leveringstid: "Avtales per prosjekt.",
        priceFrom: 14900,
        priceIsFixed: true,
        priceNote:
            "3D-animert hjemmeside: 14 900 kr fastpris. Større prosjektsider og boligvelgere prises etter omfang.",
        faq: [
            {
                q: "Prises en hjemmeside etter timer eller fast?",
                a: "Fast. Du får en pris før vi begynner, og den endrer seg ikke med hvor lang tid siden tar å bygge. Større prosjektsider med boligvelger prises etter omfang.",
            },
            {
                q: "Hva er en prosjektside for et boligprosjekt?",
                a: "En egen nettside for ett byggeprosjekt, der interessenter finner visualiseringer, plantegninger, priser og ledige enheter samlet. Poenget er at kjøperen får hele prosjektet på ett sted i stedet for i en PDF.",
            },
            {
                q: "Lager dere også nettsider uten 3D?",
                a: "Ja. 3D er det vi kan best, men en nettside uten 3D er et helt vanlig oppdrag.",
            },
        ],
    },
];

/* ========================================================================
 * FAQ – vises på forsiden og legges som FAQPage-schema.
 * ===================================================================== */

export const faqs: { q: string; a: string }[] = [
    {
        q: "Hva koster 3D-visualisering hos Usett?",
        a: "Usett tilbyr tre pakker: Basis 24 000 kr, Proff 39 000 kr og Komplett 53 500 kr, alle per prosjekt. Endelig pris avhenger av antall bilder og kompleksitet, og du kan supplere med tilleggsvalg som 2D salgstegninger (1 500 kr per plan), AI-genererte sesongbilder (3 000 kr per bilde) og animasjon (4 500 kr).",
    },
    {
        q: "Hvor i landet leverer dere?",
        a: "Overalt. 3D-visualisering, animasjon og plantegninger lager vi digitalt, så det spiller ingen rolle om du sitter i Tromsø eller på Nesodden – alt går på e-post. Studioet vårt ligger i Østfold, og 3D-skanning og dronefoto krever at vi møter opp fysisk. Det gjør vi fast i Østfold-området, og ellers i landet etter avtale.",
    },
    {
        q: "Hvor lang tid tar en 3D-visualisering?",
        a: "Mange oppdrag leveres innen 48 timer. Større prosjekter med animasjon eller flere bilder avtales individuelt, men Usett er kjent for rask levering.",
    },
    {
        q: "Hva trenger Usett fra meg for å komme i gang?",
        a: "Plantegninger og fasadetegninger er nok. Vi tar imot DWG, IFC, SKP og PDF. Har du i tillegg materialvalg, fargekoder eller referansebilder på ønsket stil, treffer vi raskere på første utkast.",
    },
    {
        q: "Hva er forskjellen på interiør- og eksteriørvisualisering?",
        a: "Interiørvisualisering viser rommene innvendig med lys, materialer og møblering, mens eksteriørvisualisering viser bygget utvendig – fasader og bygg satt inn i realistiske omgivelser.",
    },
    {
        q: "Tilbyr dere 3D-skanning og Digital Twin, og hva koster det?",
        a: "Ja. 3D-skanning hos Usett koster fra 5 000 kr eks. mva. for bygg og lokaler opptil 100 kvadratmeter, og er en egen tjeneste uavhengig av visualiseringspakkene. Vi skanner det som allerede står der og lager nøyaktige 3D-modeller og Digital Twin. En Digital Twin er målriktig – bygget fra faktiske målinger, ikke fra tegninger. Skanning må gjøres på stedet, fast i Østfold-området og ellers i landet etter avtale.",
    },
    {
        q: "Lager dere også dronefoto, fotomontasje og 2D-plantegninger?",
        a: "Ja. Usett tilbyr foto- og dronemontasje der 3D-modellen settes inn i ekte foto, samt tydelige 2D-plantegninger for prospekt og søknad til 1 500 kr per plan.",
    },
    {
        q: "Lager dere hjemmesider?",
        a: "Ja. Usett lager moderne, raske hjemmesider – gjerne med innebygd 3D og visualisering som løfter presentasjonen av prosjektene dine.",
    },
];

/* ========================================================================
 * RUTER – én kilde for sitemap.
 * Legg til nye sider her, så havner de automatisk i sitemap.xml.
 * ===================================================================== */

export type RouteDef = {
    path: string;
    priority: number;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
};

export const staticRoutes: RouteDef[] = [
    { path: "/", priority: 1.0, changeFrequency: "monthly" },
    { path: "/priser", priority: 0.9, changeFrequency: "monthly" },
    { path: "/tjenester", priority: 0.8, changeFrequency: "monthly" },
    { path: "/byggeprosessen", priority: 0.6, changeFrequency: "yearly" },
    { path: "/personvern", priority: 0.3, changeFrequency: "yearly" },
];
