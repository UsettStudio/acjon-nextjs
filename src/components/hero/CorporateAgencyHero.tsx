import AnimatedCounterTwo from '../shared/Counter/AnimatedCounterTwo';
import Image from 'next/image';

const CorporateAgencyHero = () => {
    return (
        <div className="cr-hero-area z-index-1 cr-hero-ptb"
            style={{ backgroundColor: "#073333", backgroundImage: `url(/assets/img/corporate-agency/shape/hero-bg-shape.png)` }}>
            <div className="cr-hero-shape-1" data-speed=".8">
                <Image width={152} height={337} src="/assets/img/corporate-agency/shape/hero-shape-1.png" alt="hero shape" />
            </div>
            <div className="container container-1690">
                <div className="row justify-content-center">
                    <div className="col-xl-8">
                        <div className="cr-hero-title-box p-relative mb-80">
                            <h2 className="cr-hero-title cr-hero-line tp_fade_anim" data-delay=".3">
                                <span className="d-flex align-items-center text-1">
                                    <Image width={97} height={97} src="/assets/img/corporate-agency/avater/avater-1.png" alt="avater image" />
                                    Resonance <br />
                                </span>
                                Corporate <br />
                                <span className="text-3">Agency</span>
                            </h2>
                            <div className="cr-hero-text tp_fade_anim" data-delay=".5">
                                <p>
                                    At Acjon we are more than just a <br />
                                    creative agency we are innovators, storytellers, <br />
                                    and digital architects.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="cr-hero-client-wrap d-flex align-items-center tp_fade_anim" data-delay=".6">
                            <div className="cr-hero-client-img">
                                <Image width={150} height={60} src="/assets/img/corporate-agency/avater/avater-2.png" alt="avater" />
                            </div>
                            <div className="cr-hero-client-info">
                                <h4><AnimatedCounterTwo min={0} max={18} />k+</h4>
                                <span>customers word- wide</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="cr-hero-bottom-text d-flex justify-content-md-end tp_fade_anim" data-delay=".7">
                            <span>Research, <br /> Wireframe, Design</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateAgencyHero;