import { ButtonArrowIcon, TextLogoIcon } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const CreativeAgencyHero = () => {
    return (
        <div className="ca-hero-area ca-hero-ptb fix z-index-1 pb-200">
            <div className="ca-hero-round-shape">
                <div className="ma-hero-circle">
                    <div className="dgm-hero-text-circle tp_fade_anim" data-delay=".7" data-duration="1.2" data-fade-from="top" data-ease="bounce">
                        <Link className="p-relative" href="#">
                            <span className="dgm-hero-text-shape">
                                <Image width={130} height={130} src="/assets/img/creative-agency/hero/hero-title-circle.png" alt="hero title circle" />
                            </span>
                            <span className="dgm-hero-icon">
                                <TextLogoIcon />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ca-hero-heading-wrap p-relative">
                            <div className="ca-hero-thumb-2" data-speed="1.1">
                                <Image width={230} height={289} src="/assets/img/creative-agency/hero/hero-thumb-2.jpg" alt="hero thumb" />
                            </div>
                            <div className="ca-hero-title-box z-index-1">
                                <div className="ca-hero-title-shape tp_fade_anim" data-delay="1.3" data-duration="1.2" data-fade-from="top" data-ease="bounce">
                                    <Image width={98} height={95} src="/assets/img/creative-agency/hero/hero-title-shape-2.png" alt="title shape" />
                                </div>
                                <h4 className="ca-hero-title tp-char-animation">Where creativity <br />
                                    <span>
                                        <Image width={141} height={80} src="/assets/img/creative-agency/hero/hero-title-shape.png" alt="title shape" />
                                    </span>  takes flight</h4>
                            </div>
                            <div className="ca-hero-bottom-box">
                                <div className="ca-hero-funfact d-flex mb-30 tp_fade_anim" data-delay=".3">
                                    <div className="ca-hero-funfact-thumb">
                                        <Image width={144} height={60} src="/assets/img/creative-agency/hero/hero-thumb-3.jpg" alt="hero thumb" />
                                    </div>
                                    <div className="ca-hero-funfact-content">
                                        <span>18k+</span>
                                        <p>customers word.</p>
                                    </div>
                                </div>
                                <div className="ca-hero-bottom-text mb-40 tp_fade_anim" data-delay=".5">
                                    <p>At the heart of our philosophy is the unwavering <br />
                                        belief that excellence is defined by quality, not by how <br />
                                        much we produce Every project.</p>
                                </div>
                                <div className="ca-hero-btn tp_fade_anim" data-delay=".7">
                                    <Link href="/contact-us" className="tp-btn-green tp-btn-anim btn-white-bg">
                                        <div className="tp-btn-text">
                                            Get In touch
                                        </div>
                                        <span>
                                            <ButtonArrowIcon />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="ca-hero-thumb tp-clip-anim fix">
                            <Image width={770} height={490} className="tp-anim-img" data-animate="true" src="/assets/img/creative-agency/hero/hero-thumb-1.jpg" alt="hero thumb" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreativeAgencyHero;