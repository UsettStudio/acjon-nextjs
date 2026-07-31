import ProjectBreadcrumb from "@/components/breadcrumb/ProjectBreadcrumb";
import ConsentSettingsLink from "@/components/consent/ConsentSettingsLink";
import { siteConfig } from "@/data/siteConfig";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Personvernerklæring",
    description:
        "Slik behandler Usett 3D Studio personopplysninger: hva vi samler inn, hvorfor, hvor lenge vi lagrer det, og hvilke rettigheter du har.",
    alternates: { canonical: "/personvern" },
    robots: { index: true, follow: true },
};

const SIST_OPPDATERT = "31. juli 2026";

const Page = () => {
    return (
        <main>
            <ProjectBreadcrumb
                headingPrimary="Personvern"
                headingSecondary="erklæring"
                breadcrumbLabel="Personvern"
                description={`Slik behandler vi personopplysninger. Sist oppdatert ${SIST_OPPDATERT}.`}
            />

            <section className="pb-160" style={{ paddingTop: "40px" }}>
                <div className="container">
                    <div className="row">
                        <div className="col-xl-8 offset-xl-2 col-lg-10 offset-lg-1">
                            <div className="usett-legal">
                                <p>
                                    Denne erklæringen forklarer hvilke personopplysninger{" "}
                                    {siteConfig.legalName} samler inn, hvorfor vi samler dem inn, og
                                    hvilke rettigheter du har. Vi behandler personopplysninger i tråd
                                    med personvernforordningen (GDPR) og norsk personopplysningslov.
                                </p>

                                <h2>1. Behandlingsansvarlig</h2>
                                <p>
                                    <strong>{siteConfig.legalName}</strong>
                                    <br />
                                    {siteConfig.address.streetAddress}, {siteConfig.address.postalCode}{" "}
                                    {siteConfig.address.addressLocality}
                                    <br />
                                    Org.nr: {siteConfig.orgNumber}
                                    <br />
                                    E-post:{" "}
                                    <Link href={`mailto:${siteConfig.email}`}>{siteConfig.email}</Link>
                                    <br />
                                    Telefon:{" "}
                                    <Link href={`tel:${siteConfig.telephone}`}>
                                        {siteConfig.telephoneDisplay}
                                    </Link>
                                </p>

                                <h2>2. Hvilke opplysninger vi samler inn</h2>
                                <p>
                                    Vi samler inn opplysninger du selv oppgir, og enkelte opplysninger
                                    som registreres automatisk når du bruker nettstedet.
                                </p>
                                <ul>
                                    <li>
                                        <strong>Kontaktopplysninger:</strong> navn, e-postadresse,
                                        telefonnummer og firmanavn.
                                    </li>
                                    <li>
                                        <strong>Prosjektopplysninger:</strong> beskrivelse av prosjektet
                                        ditt, type bygg, tidsramme og eventuelle tegninger eller filer du
                                        sender oss.
                                    </li>
                                    <li>
                                        <strong>Opplysninger fra annonseskjemaer:</strong> fyller du ut et
                                        skjema i en annonse fra oss på Facebook eller Instagram, mottar vi
                                        navnet, e-postadressen, telefonnummeret og svarene du oppgir.
                                    </li>
                                    <li>
                                        <strong>Tekniske opplysninger:</strong> IP-adresse, nettlesertype,
                                        enhet og hvilke sider du besøker.
                                    </li>
                                </ul>

                                <h2>3. Hvorfor vi behandler opplysningene</h2>
                                <ul>
                                    <li>
                                        <strong>For å svare på henvendelser og gi pristilbud.</strong>{" "}
                                        Behandlingsgrunnlaget er tiltak før avtaleinngåelse på din
                                        anmodning (GDPR art. 6 nr. 1 bokstav b).
                                    </li>
                                    <li>
                                        <strong>For å levere og administrere oppdrag</strong> vi har
                                        avtalt med deg (art. 6 nr. 1 bokstav b).
                                    </li>
                                    <li>
                                        <strong>For å forbedre nettstedet og markedsføringen vår.</strong>{" "}
                                        Grunnlaget er berettiget interesse (art. 6 nr. 1 bokstav f), eller
                                        samtykke der det kreves.
                                    </li>
                                    <li>
                                        <strong>For å oppfylle lovpålagte plikter,</strong> som bokføring
                                        (art. 6 nr. 1 bokstav c).
                                    </li>
                                </ul>

                                <h2>4. Annonsering på Facebook og Instagram</h2>
                                <p>
                                    Vi annonserer på plattformer levert av Meta Platforms Ireland Ltd.
                                    Sender du inn et skjema direkte i en annonse («hurtigskjema»),
                                    overføres opplysningene du oppgir fra Meta til oss. Vi bruker dem
                                    utelukkende til å kontakte deg om forespørselen din.
                                </p>
                                <p>
                                    Dersom du samtykker til markedsføringskapsler, kan vi også bruke
                                    Meta-pikselen på usett.no for å måle effekten av annonsene våre.
                                    Uten slikt samtykke lastes den ikke. Du kan justere hvordan opplysningene dine
                                    brukes til annonsering i{" "}
                                    <a
                                        href="https://www.facebook.com/adpreferences"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        annonseinnstillingene dine hos Meta
                                    </a>
                                    . Metas personvernerklæring finner du på{" "}
                                    <a
                                        href="https://www.facebook.com/privacy/policy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        facebook.com/privacy/policy
                                    </a>
                                    .
                                </p>

                                <h2>5. Informasjonskapsler</h2>
                                <p>
                                    Nettstedet bruker informasjonskapsler (cookies) som er nødvendige for
                                    at siden skal fungere, samt statistikk- og markedsføringskapsler der
                                    du har samtykket til det. Du kan når som helst endre valget ditt:
                                </p>
                                <p>
                                    <ConsentSettingsLink />
                                </p>
                                <p>
                                    Du kan også slette eller blokkere informasjonskapsler i
                                    nettleserinnstillingene dine. Nødvendige kapsler kan ikke slås av uten
                                    at deler av nettstedet slutter å virke.
                                </p>

                                <h2>6. Hvem vi deler opplysninger med</h2>
                                <p>
                                    Vi selger aldri personopplysninger. Vi deler dem kun med leverandører
                                    som behandler opplysninger på våre vegne, og som er bundet av
                                    databehandleravtale — for eksempel leverandører av e-post, skylagring,
                                    nettsted og annonseplattformer. Enkelte av disse er etablert utenfor
                                    EU/EØS. Ved slik overføring bruker vi EUs standard
                                    personvernbestemmelser eller et annet gyldig overføringsgrunnlag.
                                </p>

                                <h2>7. Hvor lenge vi lagrer opplysningene</h2>
                                <ul>
                                    <li>
                                        <strong>Forespørsler som ikke fører til oppdrag:</strong> slettes
                                        senest 12 måneder etter siste kontakt.
                                    </li>
                                    <li>
                                        <strong>Kundeopplysninger:</strong> lagres så lenge kundeforholdet
                                        varer.
                                    </li>
                                    <li>
                                        <strong>Regnskapsmateriale:</strong> lagres i fem år etter
                                        regnskapsårets slutt, slik bokføringsloven krever.
                                    </li>
                                </ul>

                                <h2>8. Dine rettigheter</h2>
                                <p>
                                    Du har rett til å be om innsyn i opplysningene vi har om deg, få dem
                                    rettet eller slettet, be om begrensning av behandlingen, protestere mot
                                    behandling basert på berettiget interesse, og få opplysningene dine
                                    utlevert i et maskinlesbart format. Har du gitt samtykke, kan du når
                                    som helst trekke det tilbake.
                                </p>
                                <p>
                                    Send en e-post til{" "}
                                    <Link href={`mailto:${siteConfig.email}`}>{siteConfig.email}</Link>, så
                                    svarer vi innen 30 dager.
                                </p>

                                <h2>9. Klage</h2>
                                <p>
                                    Mener du at vi behandler personopplysningene dine i strid med
                                    regelverket, kan du klage til Datatilsynet. Kontaktinformasjon finner
                                    du på{" "}
                                    <a
                                        href="https://www.datatilsynet.no/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        datatilsynet.no
                                    </a>
                                    .
                                </p>

                                <h2>10. Endringer</h2>
                                <p>
                                    Vi kan oppdatere denne erklæringen. Gjeldende versjon ligger alltid på
                                    denne siden, med dato for siste oppdatering øverst.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .usett-legal { font-size: 16px; line-height: 1.75; }
                .usett-legal h2 {
                    font-size: 1.15rem;
                    font-weight: 600;
                    margin: 42px 0 12px;
                    letter-spacing: -0.01em;
                }
                .usett-legal p { margin: 0 0 16px; }
                .usett-legal ul { padding-left: 20px; margin: 0 0 16px; }
                .usett-legal li { margin: 6px 0; }
                .usett-legal a { text-decoration: underline; text-underline-offset: 2px; }
            `,
                }}
            />
        </main>
    );
};

export default Page;
