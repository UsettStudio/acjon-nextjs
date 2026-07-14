"use client"
import { text_swiper_params } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { StarIconTwo } from "@/svg/StarIcons";
import { StarIcon } from "@/svg";

const TextSliderArea = () => {
    // first slide data
    const firstSliderData = [
        "Creative Digital",
        "Ui Design",
        "branding",
        "marketing",
        "Business",
        "SEO",
        "Business Consulting",
        "Creative Digital",
        "Ui Design",
        "branding",
        "marketing",
        "Business",
        "SEO",
        "Business Consulting",
        "Ui Design",
        "branding",
        "marketing",
        "Business",
        "SEO",
        "Business Consulting",
        "Creative Digital",
    ];

    // second slide data
    const secondSliderData = [
        "Digital Agency",
        "Business  Agency",
        "Creative Agency",
        "Digital Agency",
        "Business  Agency",
        "Creative Agency",
    ];

    return (
        <div className="tp-text-slider-ptb pt-30 pb-120">
            {/* First Slider */}
            <div className="tp-text-slider-wrapper">
                <Swiper
                    className="tp-text-slider-active fix slide-transtion"
                    dir="rtl"
                    {...text_swiper_params}
                >
                    {firstSliderData.map((item, i) => (
                        <SwiperSlide key={i}>
                            <div className="tp-text-slider-item">
                                <span>{item}</span>
                                <span>
                                    <StarIcon />
                                </span>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Second Slider */}
            <div className="tp-text-slider-wrapper style-2">
                <Swiper
                    className="tp-text-slider-active fix slide-transtion"
                    {...text_swiper_params}
                >
                    {secondSliderData.map((item, i) => (
                        <SwiperSlide key={i}>
                            <div className="tp-text-slider-item">
                                <span>{item}</span>
                                <span>
                                    <StarIconTwo />
                                </span>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default TextSliderArea;
