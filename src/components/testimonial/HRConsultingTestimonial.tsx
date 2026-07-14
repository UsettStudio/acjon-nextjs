"use client";
import HRConsutltingItem from './subComponents/HRConsutltingTestiItem';
import { hr_testimonial_swiper_params } from '@/constants/swiper';
import testimonialsData from '@/data/testimonialData';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ShapeTitleLine } from '@/svg/ShapeIcons';
import Image from 'next/image';
import React from 'react';

const HRConsultingTestimonial: React.FC = () => {
    return (
        <section className="hr-testimonial-ptb hr-gradient-bg pr-160 z-index-1">
            <div className="row">
                {/* Left Image Section */}
                <div className="col-xl-6">
                    <div className="hr-testimonial-thumb fix tp-clip-anim">
                        <Image
                            src="/assets/img/hr-consulting/testimonial/testi-1.png"
                            width={811}
                            height={950}
                            alt="Testimonial illustration"
                            className="w-100 tp-anim-img"
                            data-animate="true"
                            data-speed=".8"
                        />
                    </div>
                </div>
                {/* Right Content Section */}
                <div className="col-xl-6 pt-120 pb-120">
                    {/* Title */}
                    <div className="hr-portfolio-title-box pl-40 mb-45">
                        <span className="tp-section-subtitle st-dot st-border white-style tp_fade_anim"
                            data-delay=".3">
                            Our Testimonial
                        </span>
                        <h4 className="tp-section-title tl-spacegro text-case-int text-white tp-split-title">
                            Success stories from <br />
                            our saluted
                            <span className="clr p-relative">
                                clients.
                                <ShapeTitleLine />
                            </span>
                        </h4>
                    </div>
                    {/* Testimonial Slider */}
                    <div
                        className="hr-testimonial-slider-wrap p-relative tp_fade_anim"
                        data-delay=".7"
                    >
                        <div className="hr-testimonial-item-wrap">
                            <div className="swiper tp-testimonial-active">
                                <div className="swiper-wrapper">
                                    <Swiper
                                      {...hr_testimonial_swiper_params}
                                    >
                                        {testimonialsData.slice(35, 37).map((item, index) => (
                                            <SwiperSlide key={index}>
                                                <HRConsutltingItem {...item} />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            </div>
                        </div>
                        <div className="tp-dot"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HRConsultingTestimonial;
