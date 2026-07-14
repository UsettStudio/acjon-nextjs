"use client";
import DesignStudioTestiItem from './subComponents/DesignStudioTestiItem';
import { testimonial_swiper_two_params } from '@/constants/swiper';
import testimonialsData from '@/data/testimonialData';
import { Swiper, SwiperSlide } from 'swiper/react';
import { TestimonialArrowIcon } from '@/svg';
import Image from 'next/image';

const DesignStudioTestimonial = () => {
    return (
        <div className="ds-testimonial-ptb pt-150 pb-150">
            <div className="container container-1510">
                <div className="row">
                    {/* ==== Heading === */}
                    <div className="col-lg-12">
                        <div className="ds-testimonial-heading mb-60">
                            <h3 className="tp-section-title tl-unbounded tp-split-title">
                                Hva kundene våre sier <br />
                                om arbeidet vårt.
                            </h3>
                        </div>
                    </div>

                    {/* ==== Left Section ==== */}
                    <div className="col-lg-5">
                        <div className="ds-testimonial-leftside p-relative">
                            <div className="ds-testimonial-counter">
                                <div className="fraction-wrapper">
                                    <div id="paginations"></div>
                                    <div className="testimonial-progress-bar">
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="ds-testimonial-thumb text-lg-end">
                                <Image
                                    src="/assets/img/design-studio/testimonial/testimonial-thumb-1.jpg"
                                    width={336}
                                    height={386}
                                    alt="testimonial thumbnail"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ==== Right Section ==== */}
                    <div className="col-lg-7">
                        <div className="ds-testimonial-wrapper p-relative pl-30">
                            <div className="ds-testimonial-slider-wrapper">
                                <div className="swiper tp-testimonial-2-active">
                                    <div className="swiper-wrapper">
                                        <Swiper
                                            {...testimonial_swiper_two_params}
                                        >
                                            {testimonialsData.slice(31, 35).map((item, index) => (
                                                <SwiperSlide key={index}>
                                                    <DesignStudioTestiItem {...item} />
                                                </SwiperSlide>
                                            ))}
                                            {/* pagination here */}
                                        </Swiper>
                                    </div>
                                </div>
                            </div>

                            {/* ==== Slider Arrows ==== */}
                            <div className="tp-testimonial-slider-arrow ds-testimonial-slider-arrow">
                                <button
                                    className="tp-testimonial-prev"
                                    tabIndex={0}
                                    aria-label="Previous slide"
                                >
                                    <span>
                                        <TestimonialArrowIcon direction="left" />
                                    </span>
                                </button>{" "}
                                <button
                                    className="tp-testimonial-next"
                                    tabIndex={0}
                                    aria-label="Next slide"
                                >
                                    <span>
                                        <TestimonialArrowIcon direction="right" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignStudioTestimonial;
