"use client";
import { hr_brand_slide_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';

const HRConsultingBrand = () => {
    // Store image data in an array
    const brandLogos = [
        { img: "/assets/img/hr-consulting/brand/brand-1.png", width: 163, height: 28 },
        { img: "/assets/img/hr-consulting/brand/brand-2.png", width: 105, height: 28 },
        { img: "/assets/img/hr-consulting/brand/brand-3.png", width: 97, height: 29 },
        { img: "/assets/img/hr-consulting/brand/brand-4.png", width: 112, height: 30 },
        { img: "/assets/img/hr-consulting/brand/brand-5.png", width: 134, height: 30 },
        { img: "/assets/img/hr-consulting/brand/brand-1.png", width: 163, height: 28 },
        { img: "/assets/img/hr-consulting/brand/brand-2.png", width: 105, height: 28 },
        { img: "/assets/img/hr-consulting/brand/brand-3.png", width: 97, height: 29 },
        { img: "/assets/img/hr-consulting/brand/brand-4.png", width: 112, height: 30 },
        { img: "/assets/img/hr-consulting/brand/brand-5.png", width: 134, height: 30 },
        { img: "/assets/img/hr-consulting/brand/brand-1.png", width: 163, height: 28 },
        { img: "/assets/img/hr-consulting/brand/brand-2.png", width: 105, height: 28 },
        { img: "/assets/img/hr-consulting/brand/brand-3.png", width: 97, height: 29 },
        { img: "/assets/img/hr-consulting/brand/brand-4.png", width: 112, height: 30 },
    ];

    return (
        <div className="hr-brand-area pt-55 pb-55" style={{ backgroundColor: "#fff" }}>
            <div className="row align-items-center">
                {/* Left title section */}
                <div className="col-xl-4">
                    <div className="hr-brand-title-box pl-160">
                        <h4 className="hr-brand-title">
                            Trusted by <br /> world leading brands
                        </h4>
                    </div>
                </div>

                {/* Right brand slider section */}
                <div className="col-xl-7">
                    <div className="hr-brand-slider-wrap">
                        <div className="swiper hr-brand-active">
                            <div className="swiper-wrapper slide-transtion">
                                <Swiper
                                    {...hr_brand_slide_params}
                                >
                                    {brandLogos.map((brand, index) => (
                                        <SwiperSlide key={index}>
                                            <div className="hr-brand-item">
                                                <Image
                                                    src={brand.img}
                                                    alt={`brand-${index + 1}`}
                                                    width={brand.width}
                                                    height={brand.height}
                                                />
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
    );
};

export default HRConsultingBrand;
