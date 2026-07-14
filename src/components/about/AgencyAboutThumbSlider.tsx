"use client";
import { ca_thumb_slider_parms } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

const thumbs = [
    "/assets/img/creative-agency/about/about-thumb-1.jpg",
    "/assets/img/creative-agency/about/about-thumb-2.jpg",
    "/assets/img/creative-agency/about/about-thumb-3.jpg",
    "/assets/img/creative-agency/about/about-thumb-4.jpg",
    "/assets/img/creative-agency/about/about-thumb-5.jpg",
    "/assets/img/creative-agency/about/about-thumb-1.jpg",
    "/assets/img/creative-agency/about/about-thumb-2.jpg",
    "/assets/img/creative-agency/about/about-thumb-3.jpg",
    "/assets/img/creative-agency/about/about-thumb-4.jpg",
    "/assets/img/creative-agency/about/about-thumb-5.jpg",
    "/assets/img/creative-agency/about/about-thumb-2.jpg",
    "/assets/img/creative-agency/about/about-thumb-3.jpg",
    "/assets/img/creative-agency/about/about-thumb-4.jpg",
];

const AgencyAboutThumbSlider = () => {
    return (
        <section className="ca-about-thumb-ptb tp-item-anime-area">
            <div className="ca-about-thumb-wrapper">
                <Swiper
                    className="ca-about-thumb-active"
                    {...ca_thumb_slider_parms}
                >
                    {thumbs.map((thumb, i) => (
                        <SwiperSlide key={i} className="tp-item-anime marque">
                            <div className="ca-about-thumb">
                                <Image className="img-fluid w-100 h-100" width={359} height={365} src={thumb} alt={`about-thumb-${i + 1}`} />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default AgencyAboutThumbSlider;
