"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { StarIconTwo } from "@/svg/StarIcons";
import { SwiperOptions } from "swiper/types";

interface SliderItem {
  title: string;
}

interface StatsSliderProps {
  data: SliderItem[];
  swiperParams: SwiperOptions;
  className?: string;
}

const CommonBrandSlider = ({ data, swiperParams, className }: StatsSliderProps) => {
  return (
    <Swiper
      className={className ?? "tp-brand-active slide-transtion"}
      {...swiperParams}
    >
      {data.map((item, index) => (
        <SwiperSlide key={index}>
          <div className="tp-about-me-slider-item">
            <span className="tp-about-me-slider-title">
              {item.title}
            </span>
            <span className="tp-about-me-slider-icon">
              <StarIconTwo />
            </span>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CommonBrandSlider;
