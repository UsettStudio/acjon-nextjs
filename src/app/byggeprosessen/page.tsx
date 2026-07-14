import FrameScrub from "@/components/scroll-cinematic/FrameScrub";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Byggeprosessen – Usett | 3D-visualisering fra grunnmur til nøkkelferdig",
    description:
        "Scroll deg gjennom byggeprosessen: et skandinavisk hus reiser seg fra grunnmur til nøkkelferdig – en cinematisk 3D-visualisering fra Usett.",
};

const byggetrinn = [
    { kicker: "Byggetrinn 01", title: "Grunnmur", in: 0.0, out: 0.14 },
    { kicker: "Byggetrinn 02", title: "Reisverk", in: 0.13, out: 0.27 },
    { kicker: "Byggetrinn 03", title: "Isolasjon", in: 0.26, out: 0.4 },
    { kicker: "Byggetrinn 04", title: "Kledning", in: 0.39, out: 0.53 },
    { kicker: "Byggetrinn 05", title: "Tak", in: 0.52, out: 0.66 },
    { kicker: "Byggetrinn 06", title: "Vinduer", in: 0.65, out: 0.79 },
    { kicker: "Byggetrinn 07", title: "Interiør", in: 0.78, out: 0.9 },
    { kicker: "Byggetrinn 08", title: "Nøkkelferdig", in: 0.89, out: 1.0 },
];

const orbitLinjer = [
    { kicker: "Usett – Konseptvisning", title: "Se prosjektet fra alle vinkler", in: 0.05, out: 0.5 },
    { kicker: "3D-visualisering", title: "Fotorealistisk – før første spadetak", in: 0.55, out: 0.97 },
];

const page = () => {
    return (
        <main className="ub-page">
            {/* Intro */}
            <section className="ub-intro">
                <div className="ub-intro-inner">
                    <span className="ub-kicker">Usett · Konseptvisning</span>
                    <h1 className="ub-h1">
                        Fra grunnmur til <br /> nøkkelferdig
                    </h1>
                    <p className="ub-lead">
                        Scroll ned og se et skandinavisk hus reise seg – trinn for trinn,
                        høyt over skyene. Slik kan vi visualisere ditt prosjekt.
                    </p>
                    <div className="ub-scroll-hint">
                        <span></span>
                        Scroll
                    </div>
                </div>
            </section>

            {/* Scrub 1: huset bygges */}
            <FrameScrub
                frameDir="/assets/scroll/bygg"
                frameCount={120}
                scrollVh={620}
                lines={byggetrinn}
            />

            {/* Mellomseksjon */}
            <section className="ub-info">
                <div className="ub-info-inner">
                    <span className="ub-kicker">Hvorfor 3D-visualisering?</span>
                    <h2 className="ub-h2">Selg prosjektet før det er bygget</h2>
                    <div className="ub-info-grid">
                        <div className="ub-info-card">
                            <span className="ub-info-num">01</span>
                            <h3>Vis hvert byggetrinn</h3>
                            <p>
                                Fra grunnmur og reisverk til kledning og tak – kjøpere og
                                beslutningstakere forstår prosjektet umiddelbart.
                            </p>
                        </div>
                        <div className="ub-info-card">
                            <span className="ub-info-num">02</span>
                            <h3>Fotorealistiske materialer</h3>
                            <p>
                                Trekledning, naturstein, sort metalltak og store vindusflater –
                                gjengitt så virkelig at det føles ferdig bygget.
                            </p>
                        </div>
                        <div className="ub-info-card">
                            <span className="ub-info-num">03</span>
                            <h3>Cinematisk opplevelse</h3>
                            <p>
                                Scrollstyrt film, drivende skyer og varmt lys gir en
                                premium presentasjon som skiller seg ut.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scrub 2: orbit rundt ferdig hus */}
            <FrameScrub
                frameDir="/assets/scroll/orbit"
                frameCount={120}
                scrollVh={440}
                lines={orbitLinjer}
            />

            {/* CTA */}
            <section className="ub-cta">
                <div className="ub-cta-inner">
                    <span className="ub-kicker">Klar til å løfte prosjektet ditt?</span>
                    <h2 className="ub-h2">
                        La oss visualisere <br /> ditt neste bygg
                    </h2>
                    <Link className="tp-btn-green btn-h-60 tp-btn-anim ub-cta-btn" href="/contact-us">
                        <div className="tp-btn-text">ta kontakt</div>
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default page;
