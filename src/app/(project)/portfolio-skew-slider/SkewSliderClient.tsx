"use client";

import Link from "next/link";
import { useSkewSlider } from "@/hooks/useSkewSlider";
import { ArrowNextPrevIcon } from "@/svg/ArrowIcon";

export const skewSliderData = [
    {
        image: "/assets/img/slider-img/skew-1.jpg",
        category: "Digital platform",
        title: ["simple", "logistics"],
        isSpanInTitle: true,
    },
    {
        image: "/assets/img/slider-img/skew-2.jpg",
        category: "Digital platform",
        title: ["Smart", "platform"],
    },
    {
        image: "/assets/img/slider-img/skew-3.jpg",
        category: "Digital platform",
        title: ["Royal", "Benz"],
    },
    {
        image: "/assets/img/slider-img/skew-4.jpg",
        category: "Digital platform",
        title: ["World's", "Relays"],
    },
    {
        image: "/assets/img/slider-img/skew-5.jpg",
        category: "Digital platform",
        title: ["Bright", "Captive"],
    },
    {
        image: "/assets/img/slider-img/skew-6.jpg",
        category: "Interactive Mind",
        title: ["Bright", "Mind"],
    },
];

const SkewSliderClient = () => {
    const { sliderRef, slideNumberRef, next, prev } = useSkewSlider();

    return (
        <main>
            <div className="skew-slider-area">
                <div className="skew-slider-wrap" ref={sliderRef}>
                    {skewSliderData.map((slide, index) => (
                        <div key={index} className="skew-slider-item slide">
                            <div
                                className="slide__img"
                                style={{ backgroundImage: `url(${slide.image})` }}
                            />
                            <div className="skew-slider-content">
                                <span>{slide.category}</span>
                                <h4>
                                    <Link href="/portfolio-details-modern-light">
                                        {slide.title[0]}
                                        <br />
                                        {slide.isSpanInTitle ? (
                                            <span>{slide.title[1]}</span>
                                        ) : (
                                            slide.title[1]
                                        )}
                                    </Link>
                                </h4>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="skew-slider-controls">
                    <div className="tp-portfolio-slider__copyright">
                        <p>
                            Have a project in mind?{" "}
                            <Link href="/contact">Let&apos;s Talk.</Link>
                        </p>
                    </div>

                    <div className="tp-portfolio-slider__social">
                        {["Fb", "In", "Be"].map((social) => (
                            <Link key={social} href="#">
                                {social}
                            </Link>
                        ))}
                    </div>

                    <div className="skew-slider-arrow slides-nav">
                        <button
                            onClick={prev}
                            className="skew-slider-prev d-flex align-items-center"
                        >
                            <span className="icon-1">
                                <ArrowNextPrevIcon direction="left" />
                            </span>
                            <span className="ml-5">Prev</span>
                        </button>

                        <button
                            onClick={next}
                            className="skew-slider-next d-flex align-items-center"
                        >
                            <span className="mr-5">Next</span>
                            <span className="icon-2">
                                <ArrowNextPrevIcon direction="right" />
                            </span>
                        </button>
                    </div>

                    <div className="slides-numbers-wrap">
                        <div className="slides-numbers">
                            <span className="active text-1" ref={slideNumberRef}>
                                01
                            </span>
                            <span className="text-2">/</span>
                            <span className="text-3">
                                {skewSliderData.length.toString().padStart(2, "0")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SkewSliderClient;
