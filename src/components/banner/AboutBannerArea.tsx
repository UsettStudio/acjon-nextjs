"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { text_swiper_params } from "@/constants/swiper";

const AboutBannerArea = () => {
    return (
        <div className="tp-about-banner-ptb">
            <div className="sa-banner-wrapper p-relative">
                {/* Background Image */}
                <Image
                    className="img-fluid w-100 h-100"
                    width={1905}
                    height={1077}
                    data-speed=".8"
                    src="/assets/img/inner-image/about/about-banner.jpg"
                    alt="about banner"
                    priority
                />

                {/* Slider */}
                <div className="tp-about-banner-slider">
                    <div className="dgm-portfolio-text-wrap">
                        <Swiper
                            className="dgm-portfolio-text-active"
                            {...text_swiper_params}
                        >
                            {[1, 2, 3, 4].map((_, index) => (
                                <SwiperSlide key={index}>
                                    <div className="dgm-portfolio-slider-item">
                                        <p>About Us</p>
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

export default AboutBannerArea;
