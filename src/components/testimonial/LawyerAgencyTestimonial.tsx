"use client";
import LawyerATestiItem from './subComponents/LawyerATestiItem';
import { lw_testimonial_swiper_params } from '@/constants/swiper';
import testimonialsData from '@/data/testimonialData';
import { SwiperSlide, Swiper } from 'swiper/react';

const LawyerAgencyTestimonial = () => {
    return (
        <div className="lw-testimonial-ptb p-relative pt-120 pb-120 fix" style={{ backgroundColor: "#0C1B1A" }}>
            <span className="lw-service-2-big-text tp-split-title">Testimonial</span>
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="lw-testimonial-title-wrap mb-60">
                            <div className="lw-testimonial-title-box text-center">
                                <span className="lw-section-subtitle mb-15">
                                    <i className="fa-light fa-gavel"></i>
                                    Our latest Testimnial
                                </span>
                                <h4 className="tp-section-title title-playfair tp-split-title fs-52 mb-20">
                                    Success stories from our <br /> valued <span>Partners</span>
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="lw-testimonial-slider-wrap">
                        <div className="swiper lw-testimonial-active">
                                <Swiper
                                    {...lw_testimonial_swiper_params}
                                >
                                    {testimonialsData.slice(37, 42).map((item, index) => (
                                        <SwiperSlide key={index}>
                                            <LawyerATestiItem {...item} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            <div className="lw-testimonial-dot"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerAgencyTestimonial;