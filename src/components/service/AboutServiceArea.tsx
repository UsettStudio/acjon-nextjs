"use client";
import AboutServiceItem from "./subComponents/AboutServiceItem";
import { sa_service_slide_params } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import servicesData from "@/data/serviceData";

const AboutServiceArea = () => {
    return (
        <div className="tp-about-inner-service-ptb pt-160 pb-130">
            <div className="container container-1510">
                <div className="row align-items-end">
                    <div className="col-lg-4">
                        <div className="tp-about-inner-service-title-box mb-80">
                            <span
                                className="tp-section-subtitle st-unbounded st-dot st-border tp_fade_anim"
                                data-delay=".3"
                            >
                                Services us
                            </span>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="tp-about-inner-service-title-box mb-80">
                            <h3 className="tp-section-title fs-42 tl-unbounded fw-600 tp-split-title">
                                Creative Services That <br />
                                Business Growth.
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="tp-about-inner-wrapper tp_fade_anim" data-delay=".5">
                <div className="swiper-container sa-service-slider-active fix">
                    <div className="swiper-wrapper">
                        <Swiper
                         className="sa-service-slider-active"
                         {...sa_service_slide_params}
                        >
                            {servicesData.slice(58, 64).map((service) => (
                                <SwiperSlide key={service.id}>
                                    <AboutServiceItem service={service} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutServiceArea;
