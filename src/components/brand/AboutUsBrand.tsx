"use client";
import { hr_brand_slide_params } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

const brands = [
    "/assets/img/hr-consulting/brand/brand-1.png",
    "/assets/img/hr-consulting/brand/brand-2.png",
    "/assets/img/hr-consulting/brand/brand-3.png",
    "/assets/img/hr-consulting/brand/brand-4.png",
    "/assets/img/hr-consulting/brand/brand-5.png",
    "/assets/img/hr-consulting/brand/brand-1.png",
    "/assets/img/hr-consulting/brand/brand-1.png",
    "/assets/img/hr-consulting/brand/brand-2.png",
    "/assets/img/hr-consulting/brand/brand-3.png",
    "/assets/img/hr-consulting/brand/brand-4.png",
    "/assets/img/hr-consulting/brand/brand-5.png",
    "/assets/img/hr-consulting/brand/brand-1.png",
];

const BrandItem: React.FC<{ image: string }> = ({ image }) => (
    <div className="hr-brand-item">
        <Image
            src={image}
            alt="brand logo"
            width={100}
            height={28}
            style={{ maxWidth: "100%", height: "auto", width: "auto" }}
        />
    </div>
);

const AboutUsBrand = () => {
    return (
        <div className="tp-about-us-brand-ptb hr-brand-area p-relative pt-55 pb-55">
            <div className="row align-items-center">
                {/* Left Title */}
                <div className="col-xl-4">
                    <div className="hr-brand-title-box pl-160">
                        <h4 className="hr-brand-title">
                            Trusted by <br /> world leading brands
                        </h4>
                    </div>
                </div>

                {/* Brand Slider */}
                <div className="col-xl-7">
                    <div className="hr-brand-slider-wrap">
                        <div className="slide-transtion">
                            <Swiper
                                className="hr-brand-active"
                                {...hr_brand_slide_params}
                            >
                                {brands.map((brand, index) => (
                                    <SwiperSlide key={index}>
                                        <BrandItem image={brand} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsBrand;
