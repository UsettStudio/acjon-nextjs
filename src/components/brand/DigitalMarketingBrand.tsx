"use client"
import { dgm_brand_slide_params } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

// Brand data
const brandData = [
    { id: 1, img: "/assets/img/digital-marketing/brand/brand-1.png", width: 129 },
    { id: 2, img: "/assets/img/digital-marketing/brand/brand-2.png", width: 82 },
    { id: 3, img: "/assets/img/digital-marketing/brand/brand-3.png", width: 76 },
    { id: 4, img: "/assets/img/digital-marketing/brand/brand-4.png", width: 83 },
    { id: 5, img: "/assets/img/digital-marketing/brand/brand-5.png", width: 98 },
    { id: 6, img: "/assets/img/digital-marketing/brand/brand-6.png", width: 140 },
    { id: 7, img: "/assets/img/digital-marketing/brand/brand-1.png", width: 129 },
    { id: 8, img: "/assets/img/digital-marketing/brand/brand-2.png", width: 82 },
    { id: 9, img: "/assets/img/digital-marketing/brand/brand-3.png", width: 76 },
    { id: 10, img: "/assets/img/digital-marketing/brand/brand-4.png", width: 83 },
];

const DigitalMarketingBrand = () => {
    return (
        <div className="dgm-brand-ptb pb-120">
            <div className="container container-1510">
                <div className="dgm-brand-slider-wrapper">
                    <Swiper
                        className="dgm-brand-active"
                        {...dgm_brand_slide_params}
                    >
                        {brandData.map((brand) => (
                            <SwiperSlide key={brand.id}>
                                <div className="dgm-brand-item">
                                    <Image
                                        src={brand.img}
                                        alt={`brand-${brand.id}`}
                                        width={brand.width}
                                        height={23}
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default DigitalMarketingBrand;
