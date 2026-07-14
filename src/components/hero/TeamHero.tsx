"use client";
import ImageHoverRevealProvider from "@/provider/ImageHoverRevealProvider";
import { ArrowIconFour, TextArrowIcon } from "@/svg/ArrowIcon";
import { text_swiper_params } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";

const TeamHero = () => {
    return (
        <ImageHoverRevealProvider>
            <div className="sa-hero-ptb fix pt-180 pb-30">
                <div className="sa-hero-text-wrapper hover-reveal-item p-relative mb-100">
                    <Swiper
                        className='tp-text-2-slider-active fix slide-transtion'
                        {...text_swiper_params}
                    >
                        {[...Array(5)].map((_, i) => (
                            <SwiperSlide key={i}>
                                <div className="sa-hero-text-item">
                                    <h3 className="sa-hero-text-title"><Link href="/contact-us">Our Creative Team</Link></h3>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="sa-hero-text-btn circle-btn-pos">
                        <Link className="tp-btn-circle z-index-1" href="/team-details">
                            <span>
                                <TextArrowIcon />
                            </span>
                            Get In touch
                        </Link>
                    </div>
                </div>
                <div className="container container-1510">
                    <div className="sa-hero-middle-wrapper bdr-none">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="sa-hero-wrapper d-block d-lg-flex">
                                    <div className="sa-hero-heading">
                                        <h3 className="sa-hero-title tp-split-title">
                                            A Talented Team <br />
                                            <span>
                                                <ArrowIconFour />
                                            </span> Driven by Passion <br />
                                            and Purpose
                                        </h3>
                                    </div>
                                    <div className="sa-hero-shape">
                                        <Image className="img-fluid w-100 h-100" width={418} height={384} src="/assets/img/startup-agancy/hero/hero-shape.png" alt="hero shape" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ImageHoverRevealProvider>
    );
};

export default TeamHero;