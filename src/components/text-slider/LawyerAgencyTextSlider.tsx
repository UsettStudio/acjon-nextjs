"use client";
import { text_swiper_params } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { StarIcon } from "@/svg";

const textSliderData = [
    { id: 1, text: "1K / Satisfied Clients" },
    { id: 2, text: "136 / Case Finished" },
    { id: 3, text: "18 / Years of Experience" },
    { id: 4, text: "95% / Client Retention Rate" },
    { id: 5, text: "20 / Satisfied Clients" },
    { id: 6, text: "1K / Satisfied Clients" },
    { id: 7, text: "136 / Case Finished" },
    { id: 8, text: "18 / Years of Experience" },
    { id: 9, text: "95% / Client Retention Rate" },
    { id: 10, text: "20 / Satisfied Clients" },
];

const LawyerAgencyTextSlider = () => {
    return (
        <div className="tp-text-slider-area">
            <div
                className="tp-text-slider-wrapper lw-text-style pt-20 pb-20"
                style={{ backgroundColor: "#dfae4f" }}
            >
                <div className="tp-text-slider-active fix swiper-container">
                    <div className="swiper-wrapper slide-transtion">
                        <Swiper
                            {...text_swiper_params}
                        >
                            {[...textSliderData, ...textSliderData].map((item) => (
                                <SwiperSlide key={`${item.id}-${Math.random()}`}>
                                    <div className="tp-text-slider-item">
                                        <span>{item.text}</span>
                                        <span>
                                            <StarIcon />
                                        </span>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerAgencyTextSlider;
