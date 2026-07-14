"use client"
import { text_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

const textSlides = [
    "We Can Do for Our Clients",
    "We Can Do for Our Clients",
    "We Can Do for Our Clients",
    "We Can Do for Our Clients",
    "We Can Do for Our Clients",
    "We Can Do for Our Clients",
];

const CreativeATextSlideTwo = ({ customCls = "" }) => {
    return (
        <div className={`ca-text-ptb ${customCls}`}>
            <div className="ca-text-slider">
                <Swiper
                    className='tp-text-slider-active slide-transtion'
                    {...text_swiper_params}
                >
                    {textSlides.map((text, index) => (
                        <SwiperSlide key={index}>
                            <div className="ca-text-item d-flex align-items-center">
                                <p>{text}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default CreativeATextSlideTwo;
