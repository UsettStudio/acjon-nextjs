"use client";
import { VideoPlayIconThree } from "@/svg/VideoPlayIcons";
import { useVideoModal } from "@/provider/VideoProvider";
import { ArrowIconTen } from "@/svg";
import Image from "next/image";
import Link from "next/link";

const AboutUsFaq = () => {
    const { playVideo } = useVideoModal();
    return (
        <div className="tp-about-us-faq-ptb pt-100 pb-100 p-relative" style={{ backgroundImage: `url(assets/img/business-consulting/pricing/faq-bg.png)` }}>
            <div className="bnc-faq-thumb-wrapper">
                <div className="bnc-faq-thumb p-relative">
                    <Image width={895} height={950} src="/assets/img/business-consulting/pricing/faq-thumb-2.jpg" alt="faq thumb" />
                    <div className="bnc-video-thumb-btn">
                        <button onClick={() => playVideo("VCPGMjCW0is")} className="dgm-hero-play-btn popup-video video-animetion">
                            <i>
                                <VideoPlayIconThree />
                            </i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="container container-1510">
                <div className="row">
                    <div className="offset-xl-6 col-xl-6 col-lg-12">
                        <div className="tp-about-us-faq-wrapper">
                            <div className="tp-about-us-faq-text">
                                <p className="tp-split-title">We&apos;re a straight forward <br />
                                    yet professional agency <br />
                                    With Theme Builder,</p>
                            </div>
                            <div className="tp-about-us-faq-content">
                                <p>Crafted for Simplicity built for pros our <br />
                                    Theme Builder empowers you to manage <br />
                                    every static element.</p>
                                <div className="tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                    <Link href="/about" className="tp-btn-green tp-btn-anim">
                                        <div className="tp-btn-text">Learn More</div>
                                        <span>
                                            <ArrowIconTen color="currentColor"/>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsFaq;