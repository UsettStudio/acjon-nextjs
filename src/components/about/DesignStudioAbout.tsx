"use client";
import AnimatedCounter from '../shared/Counter/AnimatedCounter';
import { TextArrowIcon } from '@/svg/ArrowIcon';
import Link from 'next/link';

const aboutData = [
    { title: 'Prosjekter', value: 120, suffix: '+' },
    { title: 'Kunder', value: 40, suffix: '+' },
    { title: 'År med erfaring', value: 10, suffix: '+' },
];

const DesignStudioAbout = () => {
    return (
        <div className="ds-about-ptb pt-150 pb-130" style={{ backgroundColor: "#010103" }}>
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="ds-about-heading-wrapper mb-80">
                            <h3 className="tp-section-title tl-unbounded tp-split-title">
                                Vi er de <br />
                                som skaper.
                            </h3>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="ds-about-text-wrap mb-80 tp_fade_anim" data-delay=".5">
                            {/*
                              Tallene står også i brødteksten, ikke bare i tellerne.
                              Grunnen: AnimatedCounter starter på 0 og teller opp med
                              JavaScript. Crawlerne til ChatGPT, Claude og Perplexity
                              kjører ikke JavaScript – de leser HTML-en slik den kommer
                              fra serveren, og der står tallet 0. Uten denne setningen
                              er «0 års erfaring» det en AI-modell faktisk ser.

                              Merk også at tallene tilskrives PERSONEN, ikke selskapet.
                              Vysion AS ble stiftet i juli 2026; erfaringen og prosjektene
                              er eldre enn det. Uten skillet ser en AI-modell «stiftet
                              2026» og «120 prosjekter» samtidig og leser det som en
                              motsigelse. Navnene står i selve faktasetningen fordi
                              modellen lagrer koblingen navn↔faktum, ikke side↔faktum –
                              «vi har levert 120 prosjekter» kan ikke siteres tilbake
                              til noen.
                            */}
                            <p>
                                Mikael Herman Nilsen har over 10 års erfaring i bransjen og
                                har levert over 120 prosjekter for mer enn 40 kunder. Usett
                                kombinerer kreativitet og teknisk presisjon for å skape
                                fotorealistiske 3D-opplevelser – fra visualisering til
                                digitale tvillinger og animasjon.
                            </p>
                            <div className="ds-about-btn-box">
                                <Link className="ds-about-btn" href="#kontakt-skjema">
                                    Ta kontakt
                                    <span>
                                        <TextArrowIcon />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {aboutData.map((item, index) => (
                        <div key={index} className="col-lg-4 col-md-6">
                            <div
                                className="ds-about-item p-relative mb-30 tp_fade_anim"
                                data-delay={`.${index + 3}`}
                            >
                                <span className="ds-about-item-sub">{item.title}</span>
                                <h3 className="ds-about-item-title">
                                    {/*
                                      Den animerte telleren er dekorativ og skjules for
                                      skjermlesere. Den ekte verdien ligger rett ved siden
                                      av, server-rendret og lesbar både for hjelpemidler
                                      og for crawlere som ikke kjører JavaScript.
                                    */}
                                    <span aria-hidden="true">
                                        <AnimatedCounter min={0} max={item.value} />
                                        {item.suffix}
                                    </span>
                                    <span className="visually-hidden">
                                        {item.value}
                                        {item.suffix} {item.title.toLowerCase()}
                                    </span>
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DesignStudioAbout;
