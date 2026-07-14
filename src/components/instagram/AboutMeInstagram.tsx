"use client";

import PhotoProviderWrapper from "@/provider/PhotoProviderWrapper";
import { instagram_slider_params } from "@/constants/swiper";
import { InstragramIconFour } from "@/svg/SocialIcons";
import { Swiper, SwiperSlide } from "swiper/react";
import { PhotoView } from "react-photo-view";
import Image from "next/image";

const instagramImages = [
    "/assets/img/inner-image/instragram/instragram-1.jpg",
    "/assets/img/inner-image/instragram/instragram-2.jpg",
    "/assets/img/inner-image/instragram/instragram-3.jpg",
    "/assets/img/inner-image/instragram/instragram-4.jpg",
    "/assets/img/inner-image/instragram/instragram-5.jpg",
    "/assets/img/inner-image/instragram/instragram-3.jpg",
];

const AboutMeInstagram = () => {
    return (
        <div className="cr-instagram-area">
            <div className="cr-instagram-slider-wrap">
                <PhotoProviderWrapper>
                    <Swiper
                        className="cr-instagram-active"
                        {...instagram_slider_params}
                    >
                        {instagramImages.map((imgSrc, index) => (
                            <SwiperSlide key={index}>
                                <PhotoView src={imgSrc}>
                                    <div className="cr-instagram-item contact-me p-relative">
                                        <Image
                                            style={{width:"100%", height:"auto"}}
                                            src={imgSrc}
                                            alt={`Instagram post ${index + 1}`}
                                            width={318}
                                            height={348}
                                            className="img-fluid w-100 h-auto"
                                        />
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

export default AboutMeInstagram;
