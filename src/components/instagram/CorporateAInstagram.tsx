"use client";
import PhotoProviderWrapper from '@/provider/PhotoProviderWrapper';
import { instagram_slider_params } from '@/constants/swiper';
import { InstragramIconFour } from '@/svg/SocialIcons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { PhotoView } from 'react-photo-view';
import Image from 'next/image';

const instagramImages = [
    "/assets/img/corporate-agency/instagram/insta-1.jpg",
    "/assets/img/corporate-agency/instagram/insta-2.jpg",
    "/assets/img/corporate-agency/instagram/insta-3.jpg",
    "/assets/img/corporate-agency/instagram/insta-4.jpg",
    "/assets/img/corporate-agency/instagram/insta-5.jpg",
    "/assets/img/corporate-agency/instagram/insta-4.jpg",
    "/assets/img/corporate-agency/instagram/insta-3.jpg",
    "/assets/img/corporate-agency/instagram/insta-2.jpg",
    "/assets/img/corporate-agency/instagram/insta-3.jpg",
    "/assets/img/corporate-agency/instagram/insta-5.jpg",
];

const CorporateAInstagram = () => {
    return (
        <div className="cr-instagram-area">
            <div className="cr-instagram-slider-wrap">
                <PhotoProviderWrapper>
                    <Swiper
                        className='cr-instagram-active'
                        {...instagram_slider_params}
                    >
                        {instagramImages.map((img, index) => (
                            <SwiperSlide key={index}>
                                <PhotoView src={img}>
                                    <div className="cr-instagram-item p-relative">
                                        <Image width={318} height={331} src={img} alt={`instagram-${index + 1}`} />
                                        <span className="cr-instagram-icon popup-image">
                                            <InstragramIconFour />
                                        </span>
                                    </div>
                                </PhotoView>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </PhotoProviderWrapper>
            </div>
        </div>
    );
};

export default CorporateAInstagram;
