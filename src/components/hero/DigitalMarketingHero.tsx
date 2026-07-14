"use client";
import { ArrowIcon, BottomArrowIcon, VideoPlayIconTwo } from '@/svg';
import { useVideoModal } from '@/provider/VideoProvider';
import Image from 'next/image';
import Link from 'next/link';

const DigitalMarketingHero = () => {
    const { playVideo } = useVideoModal();

    return (
        <div className="dgm-hero-area dgm-hero-style pt-190 tp-background fix" style={{ backgroundImage: `url(/assets/img/digital-marketing/hero/hero-bg-shape.jpg)` }}>
            <div className="container container-1510">
                <div className="dgm-hero-top z-index-5">
                    <div className="row">
                        <div className="col-xl-6 order-2 order-xl-1">
                            <div className="dgm-hero-thumb p-relative mr-110">
                                <div className="tp-testimonial-social-wrap">
                                    <div className="tp-testimonial-social">
                                        <Link href="#">Facebook</Link>
                                        <Link href="#">Instagram</Link>
                                        <Link href="#">Twitter</Link>
                                    </div>
                                </div>
                                <div className="fix tp-clip-anim">
                                    <Image width={591} height={730} className="w-100 tp-anim-img" data-animate="true" src="/assets/img/digital-marketing/hero/thumb-1.jpg" alt="thumb" />
                                </div>
                                <Image width={63} height={66} className="dgm-hero-shape-1" src="/assets/img/digital-marketing/shape/hero-shape-1.png" alt="shape" />
                            </div>
                        </div>
                        <div className="col-xl-6 order-1 order-xl-2">
                            <div className="dgm-hero-title-box pt-25 p-relative">
                                <h2 className="dgm-hero-title mb-35 tp_fade_anim" data-delay=".3">
                                    <span className="p-relative">
                                        <span>A digital</span>
                                        <span className="dgm-hero-play-wrap">
                                            <span className="d-flex align-items-center">
                                                <button onClick={() => playVideo("VCPGMjCW0is")} className="dgm-hero-play-btn popup-video">
                                                    <i><VideoPlayIconTwo /></i>
                                                </button>
                                                We&apos;re Global <br /> Brand Design Agency.
                                            </span>
                                        </span>
                                        <span className="d-flex align-items-center">
                                            <i className="dgm-hero-icon-arrow">
                                                <BottomArrowIcon />
                                            </i>
                                            marketing
                                        </span>
                                        Agency
                                    </span>
                                </h2>
                                <div className="dgm-hero-text tp_fade_anim" data-delay=".5">
                                    <p className="mb-80">
                                        We are a forward-thinking digital creative agency dedicated <br />
                                        to crafting impactful brand experiences.
                                    </p>
                                </div>
                                <div className="dgm-hero-text-circle tp_fade_anim" data-delay=".5" data-duration="1" data-fade-from="top" data-ease="bounce">
                                    <Link className="p-relative" href="/project-two-colum">
                                        <span className="dgm-hero-text-shape">
                                            <Image width={134} height={133} src="/assets/img/digital-marketing/shape/hero-text-shape.png" alt="text shape" />
                                        </span>
                                        <span className="dgm-hero-icon">
                                            <ArrowIcon />
                                        </span>
                                    </Link>
                                </div>
                                <span className="dgm-hero-shape-2 tp_fade_anim" data-delay=".9" data-ease="bounce" data-fade-from="top" data-duration="1">
                                    <Image width={101} height={61} src="/assets/img/digital-marketing/shape/hero-shape-2.png" alt="hero shape" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalMarketingHero;