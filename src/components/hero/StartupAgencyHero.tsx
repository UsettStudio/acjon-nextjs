"use client";
import { FacebookIconThree, InstragramIconThree, LinkdinIcon, TwitorIconThree } from '@/svg/SocialIcons';
import { ArrowIconFour, TextArrowIcon } from '@/svg/ArrowIcon';
import { text_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import Link from 'next/link';

const StartupAgencyHero = () => {
    return (
        <div className="sa-hero-ptb fix pt-180 pb-30">
            <div className="sa-hero-text-wrapper hover-reveal-item p-relative mb-100">
                <Swiper
                    className='tp-text-2-slider-active fix slide-transtion'
                    {...text_swiper_params}
                >
                    {[...Array(5)].map((_, i) => (
                        <SwiperSlide key={i}>
                            <div className="sa-hero-text-item">
                                <h3 className="sa-hero-text-title"><Link href="/contact-us">Business Startup</Link></h3>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="sa-hero-text-btn circle-btn-pos">
                    <Link className="tp-btn-circle z-index-1" href="#">
                        <span>
                            <TextArrowIcon />
                        </span>
                        Get In touch
                    </Link>
                </div>
            </div>
            <div className="container container-1510">
                <div className="sa-hero-middle-wrapper">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="sa-hero-wrapper d-block d-lg-flex">
                                <div className="sa-hero-heading">
                                    <h3 className="sa-hero-title tp-split-title">
                                        creative <br />
                                        <span>
                                            <ArrowIconFour />
                                        </span> strategies to <br />
                                        get growing
                                    </h3>
                                </div>
                                <div className="sa-hero-shape">
                                    <Image width={418} height={384} src="/assets/img/startup-agancy/hero/hero-shape.png" alt="shape" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="sa-hero-bottom-wrap">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="sa-hero-social">
                                <Link href="#"><span>
                                    <FacebookIconThree />
                                </span></Link>
                                <Link href="#"><span>
                                    <TwitorIconThree />
                                </span></Link>
                                <Link href="#"><span>
                                    <InstragramIconThree />
                                </span></Link>
                                <Link href="#"><span>
                                    <LinkdinIcon />
                                </span></Link>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="sa-hero-info d-flex justify-content-lg-end">
                                <div className="sa-hero-info-item">
                                    <Link className="tp-line-black" href="tel:0123456789">+ (562) 568 625 00</Link>
                                </div>
                                <div className="sa-hero-info-item">
                                    <Link className="tp-line-black" href="mailto:Support@gmail.com">Support@gmail.com</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartupAgencyHero;