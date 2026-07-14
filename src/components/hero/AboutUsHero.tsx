"use client";
import { BehanceIconTwo, DribbbleIconTwo, TwitorIconFour } from "@/svg/SocialIcons";
import { useVideoModal } from "@/provider/VideoProvider";
import { VideoPlayIconSix } from "@/svg/VideoPlayIcons";
import { InstragramIconTwo } from "@/svg";
import Image from "next/image";
import Link from "next/link";

const AboutUsHero = () => {
    const { playVideo } = useVideoModal();

    return (
        <div className="tp-about-me-hero-ptb pb-70">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="tp-about-me-hero-wrapper z-index-1">
                            <div className="tp-about-me-hero-heading text-center">
                                <h4 className="tp-about-me-hero-title tp_fade_anim" data-delay=".3">Get to know <br /> me!</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row align-items-lg-end">
                    <div className="col-lg-3 col-md-6">
                        <div className="tp-about-me-hero-thumb p-relative mt-180" data-speed="1.1">
                            <Image className="img-fluid" width={313} height={418} src="/assets/img/inner-image/about-me/about-me-1.jpg" alt="about image" />
                            <div className="tp-about-me-hero-video">
                                <a onClick={() => playVideo("VCPGMjCW0is")} className="popup-video">
                                    <span>
                                        <VideoPlayIconSix />
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-9">
                        <div className="tp-about-me-hero-main pl-100 pb-60">
                            <div className="tp-about-me-hero-thumb-2 text-lg-end pb-70" data-speed=".9">
                                <Image className="img-fluid" width={450} height={464} src="/assets/img/inner-image/about-me/about-me-2.jpg" alt="about image" />
                            </div>
                            <div className="row align-items-end">
                                <div className="col-md-8">
                                    <div className="tp-about-me-hero-wrap">
                                        <div className="tp-about-me-hero-work">
                                            <span>Open to work</span>
                                        </div>
                                        <div className="tp-about-me-hero-subtitle">
                                            <h4>I am Creative <br /> designer based in London</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="tp-about-me-hero-social text-md-end">
                                        <Link href="#"><InstragramIconTwo /></Link>
                                        <Link href="#"><TwitorIconFour /></Link>
                                        <Link href="#"><DribbbleIconTwo /></Link>
                                        <Link href="#"><BehanceIconTwo /></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsHero;