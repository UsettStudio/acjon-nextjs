"use client"
import { dgm_brand_slide_params } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

const brands = [
    "/assets/img/digital-marketing/brand/brand-1.png",
    "/assets/img/digital-marketing/brand/brand-2.png",
    "/assets/img/digital-marketing/brand/brand-3.png",
    "/assets/img/digital-marketing/brand/brand-4.png",
    "/assets/img/digital-marketing/brand/brand-5.png",
    "/assets/img/digital-marketing/brand/brand-6.png",
    "/assets/img/digital-marketing/brand/brand-1.png",
    "/assets/img/digital-marketing/brand/brand-2.png",
    "/assets/img/digital-marketing/brand/brand-3.png",
    "/assets/img/digital-marketing/brand/brand-4.png",
    "/assets/img/digital-marketing/brand/brand-5.png",
    "/assets/img/digital-marketing/brand/brand-6.png"
];

const LawyerAgencyBrand = () => {
    return (
        <div className="dgm-brand-area lw-brand-style pb-120">
            <div className="container">
                <div className="dgm-brand-slider-wrapper">
                    <div className="swiper dgm-brand-active">
                        <Swiper
                            {...dgm_brand_slide_params}
                        >
                            {brands.map((img, index) => (
                                <SwiperSlide key={index}>
                                    <div className="dgm-brand-item">
                                        <Image
                                            src={img}
                                            alt={`Brand ${index + 1}`}
                                            width={129}
                                            height={23}
                                            priority={index < 3}
                                        />
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

export default LawyerAgencyBrand;
