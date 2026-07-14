"use client";
import LawyerAServiceItem from './subComponents/LawyerAServiceItem';
import { lw_service_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import servicesData from '@/data/serviceData';
import { ArrowIconThirteen } from '@/svg';

const LawyerAgencyService = () => {

    return (
        <div className="lw-service-ptb pt-120 pb-120 fix">
            <div className="container-fluid">
                <div className="row">
                    <div className="offset-xl-1 col-xl-4">
                        <div className="lw-service-title-wrap pl-50">
                            <div className="lw-service-title-box">
                                <span className="lw-section-subtitle mb-15 tp-split-title">
                                    <i className="fa-light fa-gavel"></i>
                                    areas of practice
                                </span>
                                <h4 className="tp-section-title title-playfair mb-20 tp-split-title">
                                    Tailored services for <br /> your <span>success</span>
                                </h4>
                                <div className="tp_fade_anim" data-delay=".3">
                                    <p>
                                        We believe that every client has unique needs <br />
                                        and our services are designed.
                                    </p>
                                </div>
                            </div>
                            <div className="lw-service-arrow d-flex align-items-center">
                                <div className="tp_fade_anim" data-delay=".3" data-ease="bounce" data-fade-form="top">
                                    <button className="lw-service-prev">
                                        <span>
                                            <ArrowIconThirteen direction='left' />
                                        </span>
                                    </button>
                                </div>
                                <div className="tp_fade_anim" data-delay=".5" data-ease="bounce" data-fade-form="top">
                                    <button className="lw-service-next">
                                        <span>
                                            <ArrowIconThirteen direction='right' />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-7">
                        <div className="lw-service-slider-wrap">
                            <div className="swiper lw-service-active">
                                <Swiper
                                    {...lw_service_swiper_params}
                                >
                                    {servicesData.slice(46, 52).map((service, index) => (
                                        <SwiperSlide key={index}>
                                            <LawyerAServiceItem {...service} key={index} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerAgencyService;