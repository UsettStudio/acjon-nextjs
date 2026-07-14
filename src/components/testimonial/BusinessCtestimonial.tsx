"use client";
import BusinessCTestiItem from './subComponents/BusinessCTestiItem';
import { testimonial_slider_params } from '@/constants/swiper';
import testimonialsData from '@/data/testimonialData';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CDotIconTwo, StarIconNine } from '@/svg';

const BusinessCtestimonial = () => {
    return (
        <div
            className="bnc-testimonial-area pt-120 pb-110"
            style={{ backgroundColor: '#063232' }}
        >
            <div className="container container-1510">
                {/* Header Row */}
                <div className="row align-items-end">
                    <div className="col-lg-7">
                        <div className="bnc-testimonial-title-box pb-40">
                            <span className="tp-section-subtitle fs-16 st-dot tp-split-title">
                                Our Testimonial
                            </span>
                            <h3 className="tp-section-title fs-72 mb-15 tp-split-title">
                                Success Stories <br /> from Our Valued Clients.
                            </h3>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="bnc-testimonial-right text-lg-end pb-50">
                            <div
                                className="tp-testimonial-review-item tp_fade_anim"
                                data-delay=".5"
                            >
                                <div className="d-flex">
                                    <div className="tp-testimonial-review-icon">
                                        <span>
                                            <CDotIconTwo />
                                        </span>
                                    </div>
                                    <div className="tp-testimonial-review-content">
                                        <span>
                                            4.9/5 <StarIconNine />
                                        </span>
                                        <p>Based on 24 reviews on Clutch</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonial Slider */}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="bnc-testimonial-slider-wrapper">
                            <div className="bnc-testimonial-active swiper">
                                <Swiper
                                    {...testimonial_slider_params}
                                >
                                    {testimonialsData.slice(26, 31).map((item) => (
                                        <SwiperSlide key={item.id}>
                                            <BusinessCTestiItem {...item} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>

                            <div className="bnc-testimonial-dot"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessCtestimonial;
