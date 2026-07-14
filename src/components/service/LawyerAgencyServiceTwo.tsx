"use client";
import LawyerServiceTwoItem from "./subComponents/LawyerServiceTwoItem";
import { lw_service_swiper_params_two } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import servicesData from "@/data/serviceData";

const LawyerAgencyServiceTwo = () => {
    return (
        <div
            className="lw-service-2-ptb pt-145 pb-130 p-relative fix"
            style={{ backgroundColor: "#0C1B1A" }}
        >
            <span className="lw-service-2-big-text tp-split-title">Legal Practices</span>

            <div className="container container-1510">
                <div className="row justify-content-center">
                    <div className="col-xl-5">
                        <div className="lw-service-2-title-box mb-50 text-center">
                            <span className="lw-section-subtitle mb-15">
                                <i className="fa-light fa-gavel"></i>Our latest Services
                            </span>
                            <h4 className="tp-section-title title-playfair mb-20 tp-split-title">
                                Discover our latest legal <br /> expertise & <span>Services</span>
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="lw-service-2-slider-wrap">
                    <div className="swiper lw-service-2-active">
                        <Swiper
                            {...lw_service_swiper_params_two}
                        >
                            {servicesData.slice(52, 58).map((service, index) => (
                                <SwiperSlide key={index}>
                                    <LawyerServiceTwoItem {...service} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <div className="lw-service-dot"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerAgencyServiceTwo;
