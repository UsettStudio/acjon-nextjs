"use client"
import { text_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { StarIconFour } from '@/svg';

const CopyrightSliderPart = () => {
    return (
        <div className="tp-copyright-slider-wrap">
            <Swiper
                className='tp-text-slider-active slide-transtion'
                {...text_swiper_params}
            >
                {Array.from({ length: 5 }).map((_, i) => (
                    <SwiperSlide key={i}>
                        <div className="tp-copyright-slider-item d-flex align-items-center">
                            <p>acjon Agency</p>
                            <span><StarIconFour /></span>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default CopyrightSliderPart;