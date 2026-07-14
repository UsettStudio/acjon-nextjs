import { ButtonArrowIcon } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const HomeHero = () => {
    return (
        <div className="tp-hero-area tp-hero-ptb p-relative fix z-index-1" style={{ backgroundImage: `url(${"/assets/img/digital-agency/hero/hero-bg-noise.png"})`, backgroundColor: "#010103" }}>
            <div className="container container-1510">
                <div className="row align-items-end">
                    <div className="col-lg-8">
                        <div className="tp-hero-content-box-wrap p-relative">
                            <div className="tp-hero-thumb-shape" data-speed=".7">
                                <Image width={192} height={225} src="/assets/img/digital-agency/hero/hero-thumb-1.jpg" alt="hero thumb" />
                            </div>
                            <div className="tp-hero-header-wrap z-index-1">
                                <h3 className="tp-hero-title tp-char-animation">
                                    <i>Acjon</i>{" "}
                                    <span>
                                        <Image width={133} height={119} src="/assets/img/digital-agency/hero/hero-shape.png" alt="hero thumb" />
                                    </span>
                                    <br />Digital Agency
                                </h3>
                            </div>
                            <div className="tp-hero-content-box">
                                <div className="tp_fade_anim" data-delay=".5">
                                    <p>
                                        We are a forward-thinking digital creative agency <br />
                                        dedicated to crafting impactful brand.
                                    </p>
                                </div>
                                <div className="tp-hero-btn tp_fade_anim" data-delay=".7">
                                    <Link className="tp-btn-green btn-white-bg tp-btn-anim btn-h-60" href="/about-us">
                                        <div className="tp-btn-text">Explore Now </div>
                                        <span>
                                            <ButtonArrowIcon />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="tp-hero-thumb-wrapper">
                            <div className="tp-hero-thumb-inner tp_fade_anim" data-delay=".7" data-ease="bounce" data-fade-from="top" data-duration="1.2">
                                <div className="tp-hero-thumb-1">
                                    <Image width={560} height={575} src="/assets/img/digital-agency/hero/hero-thumb-2.jpg" alt="hero thumb" />
                                </div>
                            </div>
                            <div className="tp-hero-thumb-2" style={{ backgroundImage: `url(${"/assets/img/digital-agency/hero/hero-thumb-2.jpg"})` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeHero;