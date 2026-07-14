"use client";
import AboutUsTestimonialItem from "./subComponents/AboutUsTestimonialItem";
import { aboutUs_testimonial_params } from "@/constants/swiper";
import testimonialsData from "@/data/testimonialData";
import { Swiper, SwiperSlide } from "swiper/react";

const ServiceThreeTestimonial = () => {
    //display testimonial data
    const displayTestimonial = testimonialsData.slice(45, 51);
    return (
        <div className="cr-testimonial-area cr-testimonial-style inner-testimonial-style">
            <div className="container container-1510">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="ds-testimonial-wrapper">
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
                                <div className="cr-testimonial-dot"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceThreeTestimonial;