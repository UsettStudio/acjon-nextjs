"use client";

import { brand_slider_params } from "@/constants/swiper";
import CommonBrandSlider from "./CommonBrandSlider";
import { brandSliderData } from "@/data/brandData";

const AboutMeBrand = () => {
    return (
        <div className="tp-about-me-slider-ptb">
            <div className="tp-about-me-slider-wrapper">
                <CommonBrandSlider
                    data={brandSliderData}
                    swiperParams={brand_slider_params}
                />
            </div>
        </div>
    );
};

export default AboutMeBrand;
