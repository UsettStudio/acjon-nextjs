"use client";
import CreativeATestimonialItem from './subComponents/CreativeATestimonialItem';
import { ca_testimonial_params } from '@/constants/swiper';
import testimonialsData from '@/data/testimonialData';
import { Swiper, SwiperSlide } from 'swiper/react';

const CreativeATestimonial = () => {
    return (
        <div className="ca-testimonial-ptb pt-170 pb-180">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ca-testimonial-text-box text-center mb-60">
                            <h3 className="tp-section-title tl-unbounded title-white tp-split-title">
                                The Best customers <br /> Says about Acjon
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ca-testimonial-slider-wrapper">
                <div className="ca-testimonial-slider mb-35">
                    <div className="swiper ca-testimoni-slide">
                        <div className="swiper-wrapper slide-transtion">
                            <Swiper
                                {...ca_testimonial_params}
                            >
                                {testimonialsData.slice(6, 15).map((item, index) => {
                                    return (
                                        <SwiperSlide key={index}>
                                            <CreativeATestimonialItem {...item} key={index} />
                                        </SwiperSlide>
                                    )
                                })}
                            </Swiper>
                        </div>
                    </div>
                </div>
                <div className="ca-testimonial-slider">
                    <div className="swiper ca-testimoni-slide">
                        <div className="swiper-wrapper slide-transtion">
                            <Swiper
                                dir='rtl'
                                {...ca_testimonial_params}
                            >
                                {testimonialsData.slice(6, 15).map((item, index) => {
                                    return (
                                        <SwiperSlide key={index} dir="ltr">
                                            <CreativeATestimonialItem {...item} key={index} />
                                        </SwiperSlide>
                                    )
                                })}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreativeATestimonial;