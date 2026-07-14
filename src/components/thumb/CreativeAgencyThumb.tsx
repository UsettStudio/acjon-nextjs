"use client";
import { text_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';

const thumbSlides = [
    { id: 1, text: "Content Creation" },
    { id: 2, text: "Content Creation" },
    { id: 3, text: "Content Creation" },
    { id: 4, text: "Content Creation" },
    { id: 5, text: "Content Creation" },
    { id: 6, text: "Content Creation" },
];

const CreativeAgencyThumb = () => {
    return (
        <div className="ca-thumb-ptb">
            {/* Slider */}
            <div className="ca-thumb-slider">
                <Swiper
                    className='tp-text-slider-active slide-transtion'
                    {...text_swiper_params}
                >
                    {thumbSlides.map((slide) => (
                        <SwiperSlide key={slide.id}>
                            <div className="ca-thumb-item d-flex align-items-center">
                                <p>{slide.text}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Thumb Image */}
            <div className="ca-thumb-wrapper">
                <Image className='img-fluid w-100 h-100' width={1905} height={1276}
                    data-speed=".8" src="/assets/img/creative-agency/thumb/thumb-1.jpg" alt="thumb" />
            </div>
        </div>
    );
};

export default CreativeAgencyThumb;
