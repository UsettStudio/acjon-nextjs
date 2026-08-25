import ContentStyles from "@/components/seo/ContentStyles";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL, siteConfig, servicePages } from "@/data/siteConfig";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

/**
 * /tjenester/[slug]
 *
 * Én rute som gir åtte statiske sider, én per tjeneste. Poenget med å splitte
 * opp er at en AI-modell siterer én URL som svarer på ett spørsmål. Med alt
 * samlet på forsiden finnes det bare én adresse å sitere, og den prøver å
 * svare på åtte ting samtidig.
 *
 * Innholdet ligger i siteConfig.servicePages, slik at tekst, pris og FAQ
 * finnes ett sted og brukes både i synlig HTML og i strukturerte data.
 */

type Props = { params: Promise<{ slug: string }> };

/** Bygger alle åtte sidene statisk ved deploy. */
export function generateStaticParams() {
    return servicePages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const s = servicePages.find((p) => p.slug === slug);
    if (!s) return {};

    return {
        title: { absolute: `${s.metaTitle} | Usett` },
        description: s.metaDescription,
        alternates: { canonical: `/tjenester/${s.slug}` },
        openGraph: {
            type: "website",
            locale: siteConfig.locale,
            url: `/tjenester/${s.slug}`,
            siteName: siteConfig.legalName,
            title: s.metaTitle,
            description: s.metaDescription,
            images: [
                { url: siteConfig.ogImage, width: 1200, height: 630, alt: `${s.name} – Usett` },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: s.metaTitle,
            description: s.metaDescription,
        },
    };
}

export default async function TjenestePage({ params }: Props) {
    const { slug } = await params;
    const s = servicePages.find((p) => p.slug === slug);
    if (!s) notFound();

    const pageUrl = `${SITE_URL}/tjenester/${s.slug}`;
    const andre = servicePages.filter((p) => p.slug !== s.slug).slice(0, 4);

    const graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "@id": `${pageUrl}#tjeneste`,
                name: s.name,
                serviceType: s.name,
                description: s.description,
                url: pageUrl,
                provider: { "@id": `${SITE_URL}/#usett` },
                areaServed: [
                    { "@type": "Country", name: "Norge" },
                    { "@type": "AdministrativeArea", name: "Østfold" },
                ],
                audience: {
                    "@type": "BusinessAudience",
                    name: "Utbyggere, arkitekter, entreprenører og eiendomsmeglere",
                },
                // Pris legges bare inn når den faktisk er fastsatt. En Offer
                // uten pris er verdiløs; en Offer med gjettet pris er verre.
                ...(s.priceFrom
                    ? {
                          offers: {
                              "@type": "Offer",
                              url: pageUrl,
                              priceCurrency: "NOK",
                              availability: "https://schema.org/InStock",
                              // En fastpris er `price`; et «fra»-tall er
                              // priceSpecification.minPrice. Blandes de, kan en
                              // modell gjengi en fastpris som et minimum – og da
                              // lover du for lite.
                              ...(s.priceIsFixed
                                  ? { price: s.priceFrom }
                                  : {
                                        priceSpecification: {
                                            "@type": "PriceSpecification",
                                            minPrice: s.priceFrom,
                                            priceCurrency: "NOK",
                                            valueAddedTaxIncluded: false,
                                            // Arealgrensen gjør at tallet ikke står
                                            // alene. «Fra 5 000 kr» uten kontekst kan
                                            // siteres feil; «fra 5 000 kr for inntil
                                            // 100 kvm» kan ikke.
                                            ...(s.maxAreaSqm
                                                ? {
                                                      eligibleQuantity: {
                                                          "@type": "QuantitativeValue",
                                                          maxValue: s.maxAreaSqm,
                                                          unitCode: "MTK",
                                                          unitText: "kvadratmeter",
                                                      },
                                                  }
                                                : {}),
                                        },
                                    }),
                          },
                      }
                    : {}),
            },
            {
                "@type": "WebPage",
                "@id": `${pageUrl}#side`,
                url: pageUrl,
                name: s.metaTitle,
                description: s.metaDescription,
                inLanguage: siteConfig.lang,
                isPartOf: { "@id": `${SITE_URL}/#website` },
                about: { "@id": `${pageUrl}#tjeneste` },
                breadcrumb: { "@id": `${pageUrl}#brodsmuler` },
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl}#brodsmuler`,
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Usett", item: SITE_URL },
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: "Tjenester",
                        item: `${SITE_URL}/tjenester`,
                    },
                    { "@type": "ListItem", position: 3, name: s.name },
                ],
            },
            {
                "@type": "FAQPage",
                "@id": `${pageUrl}#faq`,
                inLanguage: siteConfig.lang,
                mainEntity: s.faq.map((f) => ({
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
                    <Link href="/tjenester">Tjenester</Link>
                    <span>/</span>
                    {s.name}
                </nav>

                {/* Overskriften er spørsmålet eller tjenesten, ikke en generisk etikett. */}
                <h1>{s.heading}</h1>

                {/* Svaret først – de to–tre setningene modellene faktisk henter. */}
                <p className="doc-answer">{s.answer}</p>

                <dl className="doc-meta">
                    <div>
                        <dt>Pris</dt>
                        <dd>
                            {s.priceFrom
                                ? s.priceIsFixed
                                    ? `${s.priceFrom.toLocaleString("nb-NO")} kr fastpris`
                                    : `Fra ${s.priceFrom.toLocaleString("nb-NO")} kr${
                                          s.maxAreaSqm ? ` / ${s.maxAreaSqm} kvm` : ""
                                      }`
                                : "Etter omfang"}
                        </dd>
                    </div>
                    <div>
                        <dt>Leveres til</dt>
                        <dd>
                            {s.slug === "3d-skanning" || s.slug === "foto-dronemontasje"
                                ? "Østfold fast, ellers etter avtale"
                                : "Hele Norge"}
                        </dd>
                    </div>
                    <div>
                        <dt>Studio</dt>
                        <dd>Grålum, Sarpsborg</dd>
                    </div>
                </dl>

                <h2>Dette får du</h2>
                <ul>
                    {s.deliverables.map((d) => (
                        <li key={d}>{d}</li>
                    ))}
                </ul>

                <h2>Leveringstid</h2>
                <p>{s.leveringstid}</p>

                <h2>Pris</h2>
                <p>{s.priceNote}</p>
                <p>
                    <Link href="/priser">Se alle priser og pakker</Link>
                </p>

                <h2>Spørsmål om {s.name.toLowerCase()}</h2>
                <div className="doc-faq">
                    {s.faq.map((f, i) => (
                        <details key={f.q} {...(i === 0 ? { open: true } : {})}>
                            <summary>{f.q}</summary>
                            <p>{f.a}</p>
                        </details>
                    ))}
                </div>

                <h2>Andre tjenester</h2>
                <div className="doc-links">
                    {andre.map((a) => (
                        <Link key={a.slug} className="doc-link" href={`/tjenester/${a.slug}`}>
                            <strong>{a.name}</strong>
                            <span>{a.description}</span>
                        </Link>
                    ))}
                </div>

                <div className="doc-cta">
                    <h2>Skal vi se på prosjektet ditt?</h2>
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
            </div>
        </main>
    );
}
