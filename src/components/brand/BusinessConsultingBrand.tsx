"use client";
import { brand2_slider_params } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

const brandImages = [
    "/assets/img/design-studio/brand/brand-icon-1.png",
    "/assets/img/design-studio/brand/brand-icon-2.png",
    "/assets/img/design-studio/brand/brand-icon-3.png",
    "/assets/img/design-studio/brand/brand-icon-4.png",
    "/assets/img/design-studio/brand/brand-icon-5.png",
    "/assets/img/design-studio/brand/brand-icon-6.png",
    "/assets/img/design-studio/brand/brand-icon-3.png",
    "/assets/img/design-studio/brand/brand-icon-4.png",
    "/assets/img/design-studio/brand/brand-icon-1.png",
    "/assets/img/design-studio/brand/brand-icon-2.png",
    "/assets/img/design-studio/brand/brand-icon-5.png",
    "/assets/img/design-studio/brand/brand-icon-6.png",
    "/assets/img/design-studio/brand/brand-icon-1.png",
    "/assets/img/design-studio/brand/brand-icon-2.png",
    "/assets/img/design-studio/brand/brand-icon-3.png",
    "/assets/img/design-studio/brand/brand-icon-4.png",
    "/assets/img/design-studio/brand/brand-icon-5.png",
    "/assets/img/design-studio/brand/brand-icon-6.png",
];

const BusinessConsultingBrand = () => {
    return (
        <div className="ds-brand-area pb-120">
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ds-brand-wrapper">
                            <div className="tp-brand-slider-active fix swiper">
                                <div className="swiper-wrapper slide-transtion">
                                    <Swiper
                                        {...brand2_slider_params}
                                    >
                                        {brandImages.map((src, index) => (
                                            <SwiperSlide key={index}>
                                                <div className="ds-brand-item">
                                                    <Image className="img-fluid w-100 h-100" width={239} height={101} src={src} alt={`Brand ${index + 1}`} />
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessConsultingBrand;
