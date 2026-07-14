"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";

import PersonalPortfolioHero from "@/components/hero/PersonalPortfolioHero";
import PersonalPortfolioAbout from "@/components/about/PersonalPortfolioAbout";
import PersonalPortfolioProject from "@/components/project/PersonalPortfolioProject";
import PersonalPortfolioService from "@/components/service/PersonalPortfolioService";
import PersonalPortfolioAward from "@/components/award/PersonalPortfolioAward";
import PersonalPortfolioTestimonial from "@/components/testimonial/PersonalPortfolioTestimonial";
import { personalPortfolioSwiperConfig } from "@/constants/swiper/personalPortfolioSwiper";
import PersonalPortfolioFooter from "@/layouts/footers/PersonalPortfolioFooter";
import useIsDesktop from "@/hooks/useIsDesktop";

const PersonalPortfolioClient = () => {
    const swiperRef = useRef<SwiperType | null>(null);
    const isDesktop = useIsDesktop({ breakpoint: 1199 });

    const [currentSlide, setCurrentSlide] = useState(1);
    const [totalSlides, setTotalSlides] = useState(7);

    const handleSwiperInit = (swiper: SwiperType) => {
        swiperRef.current = swiper;

        const total = swiper.params.loop
            ? swiper.slides.length - (swiper.loopedSlides || 0) * 2
            : swiper.slides.length;

        setTotalSlides(total);
        setCurrentSlide(swiper.realIndex + 1);
    };

    const handleSlideChange = (swiper: SwiperType) => {
        setCurrentSlide(swiper.realIndex + 1);
    };

    useEffect(() => {
        if (!isDesktop && swiperRef.current) {
            swiperRef.current.destroy(true, true);
            swiperRef.current = null;
        }
    }, [isDesktop]);

    return (
        <main>
            <div className="tp-portfolio-slider-spacing position-relative">
                <div className="tp-pp-slider-active">
                    {isDesktop ? (
                        <Swiper
                            {...personalPortfolioSwiperConfig({
                                onInit: handleSwiperInit,
                                onSlideChange: handleSlideChange,
                            })}
                            className="tp-pp-slider-active tp-pp-slider-height-11"
                        >
                            <SwiperSlide><PersonalPortfolioHero /></SwiperSlide>
                            <SwiperSlide><PersonalPortfolioAbout /></SwiperSlide>
                            <SwiperSlide><PersonalPortfolioProject /></SwiperSlide>
                            <SwiperSlide><PersonalPortfolioService /></SwiperSlide>
                            <SwiperSlide><PersonalPortfolioAward /></SwiperSlide>
                            <SwiperSlide><PersonalPortfolioTestimonial /></SwiperSlide>
                            <SwiperSlide><PersonalPortfolioFooter /></SwiperSlide>
                        </Swiper>
                    ) : (
                        <div className="tp-pp-slider-active tp-pp-slider-height-11 mobile-horizontal-scroll">
                            <section className="mobile-slide"><PersonalPortfolioHero /></section>
                            <section className="mobile-slide"><PersonalPortfolioAbout /></section>
                            <section className="mobile-slide"><PersonalPortfolioProject /></section>
                            <section className="mobile-slide"><PersonalPortfolioService /></section>
                            <section className="mobile-slide"><PersonalPortfolioAward /></section>
                            <section className="mobile-slide"><PersonalPortfolioTestimonial /></section>
                            <section className="mobile-slide"><PersonalPortfolioFooter /></section>
                        </div>
                    )}
                </div>

                {isDesktop && (
                    <div className="pp-slider-pagination-wrap">
                        <div className="pp-slider-pagination"></div>
                        <div className="swiper-pagination-fraction">
                            <span className="current">{String(currentSlide).padStart(2, "0")}</span>
                            <span className="total">{String(totalSlides).padStart(2, "0")}</span>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default PersonalPortfolioClient;
