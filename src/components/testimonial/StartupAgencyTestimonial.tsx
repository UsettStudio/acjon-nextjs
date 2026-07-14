"use client";
import StartupATestmonialItem from './subComponents/StartupATestmonialItem';
import { sa_testimonial_slide_params } from '@/constants/swiper';
import testimonialsData from '@/data/testimonialData';
import { Swiper, SwiperSlide } from 'swiper/react';

const StartupAgencyTestimonial = () => {
    return (
        <div
            className="sa-testimonial-ptb pt-160 pb-150"
            style={{ backgroundColor: '#010103' }}
        >
            <div className="container container">
                <div className="row">
                    <div className="col-lg-4">
                        <div
                            className="sa-testimonial-title-box pb-90 tp_fade_anim"
                            data-delay=".3"
                        >
                            <span className="tp-section-subtitle st-unbounded st-dot st-border">
                                Our Testimonial
                            </span>
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div
                            className="sa-testimonial-title-box pb-90 tp_fade_anim"
                            data-delay=".4"
                        >
                            <h3 className="tp-section-title fs-42 tl-unbounded fw-500">
                                Trusted by Innovators, <br />
                                Loved by Brands.
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonial Slider */}
            <div
                className="sa-testimonial-slider-wrapper tp_fade_anim"
                data-delay=".5">
                <div className="sa-testimonial-slider-active fix">
                    <Swiper
                        {...sa_testimonial_slide_params}
                    >
                        {testimonialsData.slice(15, 20).map((item, index) => (
                            <SwiperSlide key={index}>
                                <StartupATestmonialItem {...item} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="sa-testimonial-dot"></div>
                </div>
            </div>
        </div>
    );
};

export default StartupAgencyTestimonial;
