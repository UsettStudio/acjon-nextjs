"use client";
import { text_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { StarIconSix } from '@/svg/StarIcons';

const DesignStudioTextSlider = () => {
    const sliderItems = [
        '3D-visualisering',
        '3D-skanning / Digital Twin',
        '3D-animasjon',
        'Prosjektsider og boligvelger',
        'Produktvisualisering',
        '3D-visualisering',
        '3D-skanning / Digital Twin',
        '3D-animasjon',
        'Prosjektsider og boligvelger',
        'Produktvisualisering',
        '3D-visualisering',
        '3D-skanning / Digital Twin',
        '3D-animasjon',
        'Prosjektsider og boligvelger',
        'Produktvisualisering',
    ];

    return (
        <div className="ds-text-slider-area">
            <div className="ds-text-slider-wrapper">
                <div className="tp-text-slider-active fix">
                    <div className="swiper-wrapper slide-transtion">
                        <Swiper
                            {...text_swiper_params}
                        >
                            {sliderItems.map((text, index) => (
                                <SwiperSlide key={index}>
                                    <div className="ds-text-slider-item">
                                        <span>{text}</span>
                                        <span>
                                            <StarIconSix />
                                        </span>
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

export default DesignStudioTextSlider;
