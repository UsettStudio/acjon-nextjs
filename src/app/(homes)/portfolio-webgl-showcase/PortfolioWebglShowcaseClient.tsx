"use client";

import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Mousewheel, Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

import {
    addEvents,
    slideNextTransitionStart,
    slidePrevTransitionStart,
    verTextFragment,
} from "@/utils/WebglAnim";

import { WebGL } from "@/plugins";
import {
    portfolioWebglSlides,
    sliderImages,
} from "@/data/portfolioTwoData";

const PortfolioWebglShowcaseClient = () => {
    const webGLContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!webGLContainerRef.current) return;

        const webGL = new WebGL({
            vertex: verTextFragment().vertex,
            fragment: verTextFragment().fragment,
        });

        addEvents(webGL);
        webGLContainerRef.current.appendChild(webGL.renderer.domElement);

        return () => {
            webGL.stop();
        };
    }, []);

    return (
        <main>
            <div id="port-showcase-slider-main">
                <div className="port-showcase-slider-spaces p-relative">
                    <div
                        className="port-showcase-slider-wrap tp-slider-parallax fix"
                        id="showcase-slider-holder"
                        data-pattern-img="assets/img/webgl/1.jpg"
                    >
                        <div
                            id="showcase-slider"
                            className="swiper-container parallax-slider-active-2 p-relative"
                        >
                            <Swiper
                                direction="horizontal"
                                slidesPerView="auto"
                                touchStartPreventDefault={false}
                                speed={1000}
                                effect="fade"
                                loop
                                mousewheel
                                simulateTouch
                                navigation={{
                                    nextEl: ".swiper-next",
                                    prevEl: ".swiper-prev",
                                }}
                                pagination={{
                                    el: ".tp-slider-dot",
                                    clickable: true,
                                }}
                                modules={[Navigation, Pagination, Autoplay, Mousewheel]}
                                onSlidePrevTransitionStart={slidePrevTransitionStart}
                                onSlideNextTransitionStart={slideNextTransitionStart}
                                id="trigger-slides"
                            >
                                {portfolioWebglSlides.map((item, i) => (
                                    <SwiperSlide key={item.id}>
                                        <div
                                            className={`slide-wrap ${i === 0 ? "active" : ""}`}
                                            data-slide={i}
                                        />
                                        <div className="container container-1230">
                                            <div className="row justify-content-center">
                                                <div className="col-xl-8">
                                                    <div className="port-showcase-slider-item">
                                                        <div className="port-showcase-slider-content">
                                                            <span className="port-showcase-slider-subtitle">
                                                                <span>
                                                                    [ {item.categories.join(", ")} ]
                                                                </span>
                                                            </span>
                                                            <Link href={item.link}>
                                                                <h4 className="port-showcase-slider-title">
                                                                    <span>{item.title}</span>
                                                                </h4>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Arrows */}
                        <div className="tp-showcase-arrow-box d-flex justify-content-between">
                            <button className="tp-showcase__button-prev swiper-prev d-inline-flex align-items-center">
                                <i className="fas fa-chevron-left"></i>
                                <span>Prev</span>
                            </button>
                            <button className="tp-showcase__button-next swiper-next d-inline-flex align-items-center">
                                <span>Next</span>
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>

                        {/* Pagination */}
                        <div className="tp-slider-dot d-none d-md-block"></div>

                        {/* Social */}
                        <div className="port-showcase-slider-social d-none d-md-block">
                            <Link className="tp-hover-btn-item" href="#">Fb</Link>
                            <Link className="tp-hover-btn-item" href="#">In</Link>
                            <Link className="tp-hover-btn-item" href="#">Be</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Canvas / WebGL slider */}
            <div
                id="canvas-slider"
                className="canvas-slider"
                ref={webGLContainerRef}
            >
                {sliderImages.map((imgSrc, index) => (
                    <div key={index} className="slider-img" data-slide={index}>
                        <Image
                            className="slide-img"
                            src={imgSrc}
                            alt="showcase-img"
                            width={1920}
                            height={1280}
                        />
                    </div>
                ))}
            </div>
        </main>
    );
};

export default PortfolioWebglShowcaseClient;
