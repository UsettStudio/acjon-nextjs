"use client";
import { dgm_brand_slide_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import React from 'react';

const brandLogos = [
    { img: "/assets/img/digital-marketing/brand/brand-1.png", width: 129 },
    { img: "/assets/img/digital-marketing/brand/brand-2.png", width: 82 },
    { img: "/assets/img/digital-marketing/brand/brand-3.png", width: 76 },
    { img: "/assets/img/digital-marketing/brand/brand-4.png", width: 83 },
    { img: "/assets/img/digital-marketing/brand/brand-5.png", width: 98 },
    { img: "/assets/img/digital-marketing/brand/brand-6.png", width: 140 },
    { img: "/assets/img/digital-marketing/brand/brand-1.png", width: 129 },
    { img: "/assets/img/digital-marketing/brand/brand-2.png", width: 82 },
    { img: "/assets/img/digital-marketing/brand/brand-3.png", width: 76 },
];

const CorporateAgencyBrand: React.FC = () => {
    return (
        <div className="cr-brand-area cr-brand-style pt-120">
            <div className="container container-1510">
                <div className="row justify-content-center">
                    <div className="col-xl-6">
                        <div className="cr-brand-title-box text-center">
                            <span className="tp-section-subtitle border-line text-capitalize st-spacegro fs-16">
                                Partnering with leading global brands
                            </span>
                        </div>
                    </div>
                </div>
                <Swiper
                    className='dgm-brand-active slide-transtion'
                    {...dgm_brand_slide_params}
                >
                    {brandLogos.map((brand, index) => (
                        <SwiperSlide key={index}>
                            <div className="dgm-brand-item">
                                <Image
                                    src={brand.img}
                                    alt={`brand-${index + 1}`}
                                    width={brand.width}
                                    height={23}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default CorporateAgencyBrand;
