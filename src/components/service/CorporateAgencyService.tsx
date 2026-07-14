"use client";
import CorporateAServiceItem from './subComponents/CorporateAServiceItem';
import { cr_service_slider_params } from '@/constants/swiper';
import { ServiceArrowIcon } from '@/svg/ArrowIcon';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MessageIcon } from '@/svg/MessageIcon';
import servicesData from '@/data/serviceData';
import Link from 'next/link';
import React from 'react';

const CorporateAgencyService: React.FC = () => {
    return (
        <div className="cr-service-area pt-120 pb-120" style={{ backgroundColor: '#093535' }}>
            <div className="container container-1510">
                {/* Title + Arrows */}
                <div className="cr-service-title-wrap mb-55">
                    <div className="row align-items-end">
                        <div className="col-lg-8">
                            <div className="cr-service-title-box">
                                <span className="tp-section-subtitle text-white st-spacegro fs-16 st-dot white-style tp-split-title">
                                    Our Services
                                </span>
                                <h2 className="tp-section-title tl-spacegro fw-700 text-case-int text-white mb-0 tp-split-title">
                                    Delivering excellence <br /> through services
                                </h2>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="cr-service-arrow d-flex align-items-center justify-content-lg-end">
                                <div
                                    className="tp_fade_anim"
                                    data-delay=".3"
                                    data-fade-from="top"
                                    data-duration="1.2"
                                    data-ease="bounce"
                                >
                                    <button className="cr-service-prv">
                                        <span>
                                            <ServiceArrowIcon direction="left" />
                                        </span>
                                    </button>
                                </div>
                                <div
                                    className="tp_fade_anim"
                                    data-delay=".6"
                                    data-fade-from="top"
                                    data-duration="1.2"
                                    data-ease="bounce"
                                >
                                    <button className="cr-service-next">
                                        <span>
                                            <ServiceArrowIcon direction="right" />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slider */}
                <div className="cr-service-slider-wrap mb-60 tp_fade_anim" data-delay=".5">
                    <Swiper
                        className='cr-service-active'
                        {...cr_service_slider_params}
                    >
                        {servicesData.slice(26, 32).map((item, index) => (
                            <SwiperSlide key={index}>
                                <CorporateAServiceItem {...item} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Bottom Text */}
                <div className="row">
                    <div className="col-xl-12">
                        <div
                            className="cr-service-bottom-text tp_fade_anim"
                            data-delay=".3"
                            data-duration="1"
                            data-fade-from="bottom"
                            data-ease="bounce"
                        >
                            <p className="d-flex align-items-center justify-content-center">
                                <span>
                                    <MessageIcon />
                                </span>
                                Save your precious time and effort for finding a solution :{' '}
                                <Link href="/contact-us">Contact Us</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateAgencyService;
