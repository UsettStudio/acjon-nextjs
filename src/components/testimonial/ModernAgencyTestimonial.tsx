"use client";
import ModernATestiItem from './subComponents/ModernATestiItem';
import { testimonial_swiper_params } from '@/constants/swiper';
import testimonialsData from '@/data/testimonialData';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ButtonArrowIconTwo } from '@/svg';

const ModernAgencyTestimonial = () => {
    return (
        <section className="ma-testimonial-ptb pb-200">
            <div className="container">
                {/* Section Title */}
                <div className="row justify-content-center">
                    <div className="col-xl-8">
                        <div className="ma-testimonial-title-box text-center mb-70">
                            <span className="tp-section-subtitle fs-16 tp-split-title">
                                {`// Testimonial //`}
                            </span>
                            <h3 className="tp-section-title fs-62 tl-unbounded tp-split-title">
                                What Clients Say
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Testimonial Slider */}
                <div className="ma-testimonial-wrap p-relative">
                    <div className="swiper tp-testimonial-active">
                        <div className="swiper-wrapper">
                            <Swiper
                                {...testimonial_swiper_params}
                            >
                                {testimonialsData.slice(42, 45).map((item) => (
                                    <SwiperSlide key={item.id}>
                                        <ModernATestiItem {...item} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="ma-testimonial-arrow d-flex justify-content-end">
                        <div className="tp-testimonial-slider-arrow">
                            <button className="tp-testimonial-prev" aria-label="Previous testimonial">
                                <ButtonArrowIconTwo direction="left" />
                            </button>{" "}
                            <button className="tp-testimonial-next" aria-label="Next testimonial">
                                <ButtonArrowIconTwo direction="right" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ModernAgencyTestimonial;
