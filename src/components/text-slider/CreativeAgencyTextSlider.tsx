"use client"
import { text_swiper_params } from "@/constants/swiper";
import { SwiperSlide, Swiper } from "swiper/react";
import { StarIconTwo } from "@/svg/StarIcons";

// Slider data
const textSliderData = [
    { id: 1, label: "Web Development" },
    { id: 2, label: "UI/UX Experience" },
    { id: 3, label: "Digital Marketing" },
    { id: 4, label: "Product Design" },
    { id: 5, label: "Mobile Solution" },
    { id: 6, label: "Web Development" },
    { id: 7, label: "UI/UX Experience" },
    { id: 8, label: "Digital Marketing" },
    { id: 9, label: "Product Design" },
    { id: 10, label: "Mobile Solution" },
];

const CreativeAgencyTextSlider = ({ customClass = "" }) => {
    return (
        <div className={`ca-text-slider-ptb ${customClass}`} style={{ backgroundColor: "#C9F31D" }}>
            <div className="ca-text-slider-wrapper">
                <Swiper
                    className="tp-text-slider-active fix slide-transtion"
                    {...text_swiper_params}
                >
                    {textSliderData.map((item) => (
                        <SwiperSlide key={item.id} >
                            <div className="tp-text-slider-item">
                                <span>{item.label}</span>
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

export default CreativeAgencyTextSlider;
