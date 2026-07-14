"use client";
import { dgm_brand_swiper_params } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

// Brand data array
const brandLogos = [
    { id: 1, image: "/assets/img/design-studio/brand/brand-icon-1.png", alt: "Brand 1" },
    { id: 2, image: "/assets/img/design-studio/brand/brand-icon-2.png", alt: "Brand 2" },
    { id: 3, image: "/assets/img/design-studio/brand/brand-icon-3.png", alt: "Brand 3" },
    { id: 4, image: "/assets/img/design-studio/brand/brand-icon-4.png", alt: "Brand 4" },
    { id: 5, image: "/assets/img/design-studio/brand/brand-icon-5.png", alt: "Brand 5" },
    { id: 6, image: "/assets/img/design-studio/brand/brand-icon-6.png", alt: "Brand 6" },
    { id: 7, image: "/assets/img/design-studio/brand/brand-icon-3.png", alt: "Brand 7" },
];

const ModernAgencyBrand = () => {
    return (
        <div className="ds-brand-area">
            <div className="ds-brand-wrapper">
                <div className="dgm-brand-active-2 fix swiper">
                    <Swiper
                        className="slide-transtion"
                        {...dgm_brand_swiper_params}
                    >
                        {brandLogos.map((brand) => (
                            <SwiperSlide key={brand.id}>
                                <div className="ds-brand-item">
                                    <Image className="img-fluid h-auto" width={318} height={134} src={brand.image} alt={brand.alt} />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default ModernAgencyBrand;
