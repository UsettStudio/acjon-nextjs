"use client";
import { text_swiper_params } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";

const sliderTexts = [
    "Experiences That Connect & Convert",
    "Experiences That Connect & Convert",
    "Experiences That Connect & Convert",
    "Experiences That Connect & Convert",
    "Experiences That Connect & Convert",
    "Experiences That Connect & Convert",
];

const ServiceTwoTextSlider = () => {
    return (
        <section className="tp-copyright-slider-wrap inner-text-slider-wrap pb-95">
            <div className="swiper-container tp-text-slider-active">
                <div className="swiper-wrapper slide-transtion">
                    <Swiper {...text_swiper_params}>
                        {sliderTexts.map((text, index) => (
                            <SwiperSlide key={index}>
                                <div className="tp-copyright-slider-item d-flex align-items-center">
                                    <p>{text}</p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section >
    );
};

export default ServiceTwoTextSlider;
