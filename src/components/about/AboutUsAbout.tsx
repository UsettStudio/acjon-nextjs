import { ArrowIconTen } from "@/svg";
import Image from "next/image";
import Link from "next/link";

const AboutUsAbout = () => {
    return (
        <div className="bnc-about-ptb p-relative pt-100 pb-120">
            <div className="bnc-about-shape">
                <Image width={357} height={384} src="/assets/img/business-consulting/about/about-2-shape.png" alt="about shape" />
            </div>
            <div className="container container-1510">
                <div className="bnc-about-top-wrap pb-90">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="bnc-about-title-box">
                                <span className="tp-section-subtitle fs-16 st-dot tp_fade_anim" data-delay=".3">About us</span>
                                <h3 className="tp-section-title fs-72 tp-text-revel">marketing agency specializes
                                    in crafting data-driven strategies
                                    compelling creative content.
                                </h3>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="bnc-about-right text-lg-end" data-speed="1.1">
                                <Image width={290} height={268} src="/assets/img/business-consulting/about/about-2-thumb.jpg" alt="about thumb" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bnc-about-bottom-wrap">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="bnc-about-thumb-wrap mb-30">
                                <Image className="img-fluid" width={835} height={481} src="/assets/img/business-consulting/about/about-1-thumb.jpg" alt="about thumb" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="bnc-about-content">
                                <div className="bnc-about-content-text">
                                    <p className="tp-text-perspective">Our business consulting services are designed to unlock the full <br />
                                        potential of your company. With a deep understanding of industry <br />
                                        trends, market dynamics, and business strategies, we provide expert <br />
                                        guidance that drives growth, efficiency, and long-term success.
                                    </p>
                                    <p className="tp-text-perspective">
                                        Whether are a start-up seeking direction or an established enterprise <br />
                                        looking to scale, our tailored solutions ensure.</p>
                                </div>
                                <div className="bnc-about-content-btn-box d-flex">
                                    <div className="bnc-about-content-btn tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                        <Link className="tp-btn-green bdr-5 fw-700 ff-bricolage tp-btn-anim" href="/about">
                                            <div className="tp-btn-text">About Us </div>
                                            <span>
                                                <ArrowIconTen color="currentColor" />
                                            </span>
                                        </Link>
                                    </div>
                                    <div className="bnc-about-content-btn tp_fade_anim" data-delay=".7" data-fade-from="top" data-ease="bounce">
                                        <Link className="tp-btn-green bdr-5 fw-700 ff-bricolage bg-none-style tp-btn-anim" href="/service">
                                            <div className="tp-btn-text">More Services</div>
                                            <span>
                                                <ArrowIconTen color="currentColor" />
                                            </span>
                                        </Link>
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

export default AboutUsAbout;