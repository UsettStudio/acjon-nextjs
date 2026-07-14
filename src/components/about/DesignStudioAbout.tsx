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
                            <p>
                                Hos Usett kombinerer vi kreativitet og teknisk presisjon
                                for å skape fotorealistiske 3D-opplevelser. Fra
                                visualisering til digitale tvillinger og animasjon.
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
                                    <AnimatedCounter min={0} max={item.value} />
                                    {item.suffix}
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
