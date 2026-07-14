"use client";
import AboutUsTestimonialItem from "./subComponents/AboutUsTestimonialItem";
import { aboutUs_testimonial_params } from "@/constants/swiper";
import testimonialsData from "@/data/testimonialData";
import { Swiper, SwiperSlide } from "swiper/react";

const AboutUsTestimonial = () => {
    //display testimonial data
    const displayTestimonial = testimonialsData.slice(45, 51);

    return (
        <div className="tp-about-us-testimonial-ptb pt-160 pb-160">
            <div className="container container-1230">
                <div className="row justify-content-center">
                    <div className="col-xl-12">
                        <div className="tp-about-us-testimonial-wrap">
                            <div className="ds-testimonial-slider-wrapper text-center">
                                <div className="mb-35">
                                        <Swiper
                                            className="cr-testimonial-active text-center"
                                            {...aboutUs_testimonial_params}
                                        >
                                            {displayTestimonial.map((item, index) => (
                                                <SwiperSlide key={index}>
                                                    <AboutUsTestimonialItem {...item} />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                </div>
                                {/* Pagination */}
                                <div className="cr-testimonial-dot"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsTestimonial;
