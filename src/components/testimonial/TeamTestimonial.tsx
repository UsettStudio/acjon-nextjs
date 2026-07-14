"use client";
import { aboutUs_testimonial_params } from "@/constants/swiper";
import testimonialsData from "@/data/testimonialData";
import { Swiper, SwiperSlide } from "swiper/react";
import { QuoteIconSix } from "@/svg/QuoteIcons";

const TeamTestimonial = () => {
    //display testimonial data
    const displayTestimonial = testimonialsData.slice(45, 51);

    return (
        <div className="cr-testimonial-ptb pt-120 pb-120">
            <div className="container container-1480">
                <div className="row justify-content-center">
                    <div className="col-xl-12">
                        <div className="ds-testimonial-wrapper pricing-testimonial p-relative">
                            <div className="ds-testimonial-slider-wrapper text-center">
                                <div className="mb-35">
                                    <Swiper
                                        className="cr-testimonial-active text-center"
                                        {...aboutUs_testimonial_params}
                                    >
                                        {displayTestimonial.map((item, index) => (
                                            <SwiperSlide key={index}>
                                                <div className="ds-testimonial-item text-center">
                                                    <span className="cr-testimonial-quote">
                                                        <QuoteIconSix />
                                                    </span>
                                                    <div className="ds-testimonial-item-content">
                                                        <p>{item.content}</p>
                                                    </div>
                                                    <div className="ds-testimonial-item-des">
                                                        <span className="ds-testimonial-item-title">Kristin Watson</span>
                                                        <p>{item.role}</p>
                                                    </div>
                                                </div>
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

export default TeamTestimonial;