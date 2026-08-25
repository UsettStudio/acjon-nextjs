import ContentStyles from "@/components/seo/ContentStyles";
import JsonLd from "@/components/seo/JsonLd";
import {
    SITE_URL,
    siteConfig,
    pakker,
    tilleggsvalg,
    servicePages,
} from "@/data/siteConfig";
import type { Metadata } from "next";
import Link from "next/link";

/**
 * /priser
 *
 * Dette er den viktigste nye siden på nettstedet. Prisspørsmål er den
 * vanligste inngangen til AI-søk i denne bransjen, og de aller fleste
 * konkurrentene svarer «ta kontakt for tilbud» – som ikke kan siteres.
 * Usett har konkrete tall, og de ligger her både som lesbar tekst og som
 * Offer-schema med price + priceCurrency, slik at en maskin kan gjengi dem.
 */

// Uten "Usett" til slutt – malen i layout.tsx legger på "| Usett" selv.
const TITLE = "Hva koster 3D-visualisering? Priser og pakker";
const DESCRIPTION =
    "3D-visualisering hos Usett koster fra 24 000 kr per prosjekt. Se hva som inngår i pakkene Basis, Proff og Komplett, hva tilleggene koster, og hva som avgjør endelig pris.";

export const metadata: Metadata = {
    title: { absolute: `${TITLE} | Usett` },
    description: DESCRIPTION,
    alternates: { canonical: "/priser" },
    openGraph: {
        type: "website",
        locale: siteConfig.locale,
        url: "/priser",
        siteName: siteConfig.legalName,
        title: TITLE,
        description: DESCRIPTION,
        images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "Usett 3D Studio" }],
    },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const prisFaq = [
    {
        q: "Hva koster 3D-visualisering hos Usett?",
        a: "Fra 24 000 kr per prosjekt. Pakke Basis koster 24 000 kr og inneholder to interiørbilder og ett eksteriørbilde. Proff koster 39 000 kr, Komplett koster 53 500 kr. Alle pakker inkluderer oppstart og teksturering av 3D-modellen.",
    },
    {
        q: "Hva avgjør endelig pris?",
        a: "Antall bilder og hvor komplekst bygget er. Et rekkehusfelt med samme boligtype gjentatt koster mindre per bilde enn fire ulike boligtyper. Tillegg som plantegninger, sesongbilder og animasjon kommer i tillegg til pakkeprisen.",
    },
    {
        q: "Er prisene inkludert merverdiavgift?",
        a: "Prisene er oppgitt eksklusive merverdiavgift, slik det er vanlig i oppdrag mellom virksomheter.",
    },
    {
        q: "Hva koster en 2D-plantegning?",
        a: "1 500 kr per plan. En enebolig over to etasjer koster altså 3 000 kr for begge planene.",
    },
    {
        q: "Kan jeg kjøpe enkeltbilder i stedet for en hel pakke?",
        a: "Pakkene er satt opp fordi oppstart og teksturering av 3D-modellen er den tyngste jobben, og den er den samme enten det skal lages ett eller fire bilder. Har du et prosjekt som ikke passer i noen av pakkene, ta kontakt så setter vi opp et konkret tilbud.",
    },
    {
        q: "Hva koster en 3D-animert hjemmeside?",
        a: "14 900 kr i fastpris hos Usett. Prisen er fast, ikke et estimat, så den endrer seg ikke med hvor lang tid siden tar å bygge. Større prosjektsider med boligvelger prises etter omfang.",
    },
    {
        q: "Hva koster 3D-skanning?",
        a: "Fra 5 000 kr eks. mva. for bygg og lokaler opptil 100 kvadratmeter. Over det prises oppdraget etter areal og reisevei, fordi skanning krever fysisk oppmøte. 3D-skanning er en egen tjeneste hos Usett og prises uavhengig av visualiseringspakkene. Usett tar skanneoppdrag fast i Østfold-området og ellers i landet etter avtale.",
    },
];

export default function PriserPage() {
    const pakkeTilbud = pakker.map((p) => ({
        "@type": "Offer",
        "@id": `${SITE_URL}/priser#${p.id}`,
        name: p.name,
        description: `${p.description} Inneholder: ${p.features.join(", ")}.`,
        price: p.price,
        priceCurrency: "NOK",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/priser`,
        itemOffered: {
            "@type": "Service",
            name: `3D-visualisering – pakke ${p.name}`,
            serviceType: "3D-visualisering",
            provider: { "@id": `${SITE_URL}/#usett` },
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
        itemOffered: { "@type": "Service", name: t.name, provider: { "@id": `${SITE_URL}/#usett` } },
    }));

    const graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": `${SITE_URL}/priser#side`,
                url: `${SITE_URL}/priser`,
                name: TITLE,
                description: DESCRIPTION,
                inLanguage: siteConfig.lang,
                isPartOf: { "@id": `${SITE_URL}/#website` },
                about: { "@id": `${SITE_URL}/#usett` },
                breadcrumb: { "@id": `${SITE_URL}/priser#brodsmuler` },
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${SITE_URL}/priser#brodsmuler`,
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Usett", item: SITE_URL },
                    { "@type": "ListItem", position: 2, name: "Priser" },
                ],
            },
            {
                "@type": "OfferCatalog",
                "@id": `${SITE_URL}/priser#katalog`,
                name: "Priser hos Usett",
                itemListElement: [...pakkeTilbud, ...tilleggTilbud],
            },
            {
                "@type": "FAQPage",
                "@id": `${SITE_URL}/priser#faq`,
                inLanguage: siteConfig.lang,
                mainEntity: prisFaq.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
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
                    Priser
                </nav>

                <h1>Hva koster 3D-visualisering?</h1>

                {/*
                  Svaret først, konteksten etter. AI-modeller henter typisk de
                  første setningene etter en overskrift – bygger man opp mot
                  svaret, blir det aldri hentet. Navnet «Usett» står i selve
                  faktasetningen, slik at tallet kan siteres tilbake hit.
                */}
                <p className="doc-answer">
                    3D-visualisering hos Usett koster fra 24 000 kr per prosjekt.
                    Pakke Basis koster 24 000 kr, Proff 39 000 kr og Komplett
                    53 500 kr, alle inkludert oppstart og teksturering av
                    3D-modellen. Mange oppdrag leveres innen 48 timer.
                </p>

                <dl className="doc-meta">
                    <div>
                        <dt>Fra</dt>
                        <dd>24 000 kr</dd>
                    </div>
                    <div>
                        <dt>Leveringstid</dt>
                        <dd>Ofte 48 timer</dd>
                    </div>
                    <div>
                        <dt>Leveres til</dt>
                        <dd>Hele Norge</dd>
                    </div>
                    <div>
                        <dt>Studio</dt>
                        <dd>Grålum, Sarpsborg</dd>
                    </div>
                </dl>

                <h2>Pakker</h2>
                <div className="doc-cards">
                    {pakker.map((p) => (
                        <div
                            key={p.id}
                            id={p.id}
                            className={`doc-card${p.isPopular ? " is-popular" : ""}`}
                        >
                            {p.isPopular && <span className="tag">Mest valgt</span>}
                            <h3>{p.name}</h3>
                            <div className="price">{p.priceLabel}</div>
                            <div className="period">{p.period}</div>
                            <p>{p.description}</p>
                            <ul>
                                {p.features.map((f) => (
                                    <li key={f}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <h2>Tilleggsvalg til alle pakker</h2>
                <div className="doc-cards">
                    {tilleggsvalg.map((t) => (
                        <div key={t.id} id={t.id} className="doc-card">
                            <h3>{t.name}</h3>
                            <div className="price">{t.priceLabel}</div>
                            <div className="period">{t.unit}</div>
                            <p>{t.description}</p>
                        </div>
                    ))}
                </div>

                <h2>Hva avgjør prisen</h2>
                <p>
                    To ting: hvor mange bilder som skal lages, og hvor komplekst
                    bygget er. Den tyngste jobben er å bygge og teksturere
                    3D-modellen, og den gjøres én gang uansett hvor mange bilder
                    som hentes ut av den. Derfor blir prisen per bilde lavere jo
                    flere bilder du bestiller i samme prosjekt.
                </p>
                <p>
                    Et rekkehusfelt der samme boligtype gjentas koster mindre enn
                    fire ulike boligtyper, selv om antall bilder er det samme.
                    Skal bygget settes inn i ekte foto eller dronebilder av
                    tomten, kommer fotografering på stedet i tillegg.
                </p>

                <h2>Priser på de øvrige tjenestene</h2>
                <p>
                    3D-skanning og hjemmesider er egne tjenester og prises
                    uavhengig av visualiseringspakkene over.
                </p>
                <div className="doc-links">
                    {servicePages
                        .filter((s) => s.priceFrom !== null)
                        .map((s) => (
                            <Link key={s.slug} className="doc-link" href={`/tjenester/${s.slug}`}>
                                <strong>{s.name}</strong>
                                <span>{s.priceNote}</span>
                                <em>
                                    {s.priceIsFixed
                                        ? `${s.priceFrom?.toLocaleString("nb-NO")} kr fastpris →`
                                        : `Fra ${s.priceFrom?.toLocaleString("nb-NO")} kr →`}
                                </em>
                            </Link>
                        ))}
                </div>

                <h2>Spørsmål om pris</h2>
                <div className="doc-faq">
                    {prisFaq.map((f, i) => (
                        <details key={f.q} {...(i === 0 ? { open: true } : {})}>
                            <summary>{f.q}</summary>
                            <p>{f.a}</p>
                        </details>
                    ))}
                </div>

                <div className="doc-cta">
                    <h2>Vil du ha et konkret tall for ditt prosjekt?</h2>
                    <p>
                        Send plantegningene, så får du et tilbud med fast pris og
                        leveringsdato. Usett holder til i Høvreveien 6 på Grålum
                        ved Sarpsborg og tar oppdrag i hele Norge.
                    </p>
                    <a className="btn" href={`mailto:${siteConfig.email}`}>
                        {siteConfig.email}
                    </a>
                    <a className="btn" href={`tel:${siteConfig.telephone}`}>
                        {siteConfig.telephoneDisplay}
                    </a>
                </div>

                {/*
                  Synlig dato. Modellene foretrekker ferskt materiale ved
                  prisspørsmål, og pris er nettopp det Usett vil bli sitert på.
                  Oppdater årstallet når prisene justeres.
                */}
                <p className="doc-updated">Priser gjeldende fra 2026. Alle priser er eksklusive merverdiavgift.</p>
            </div>
        </main>
    );
}
