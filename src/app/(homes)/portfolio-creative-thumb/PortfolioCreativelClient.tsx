"use client";

import Link from "next/link";
import { portfolioThumbSliderItems } from "@/data/portfolioTwoData";
import useSlideshowPortfolio from "@/hooks/useSlideshowPortfolio";
import { ArrowNextPrevIcon } from "@/svg/ArrowIcon";

const PortfolioWebglClient = () => {
    const {
        sliderRef,
        sliderBGRef,
        sliderFGRef,
        titlesRef,
        nextBtnRef,
        prevBtnRef,
    } = useSlideshowPortfolio();

    return (
        <main>
            <div className="tp-portfolio-slider__main fix" ref={sliderRef}>
                {/* Contact */}
                <div className="tp-portfolio-slider__copyright d-none d-lg-block">
                    <p>
                        Have a project in mind?{" "}
                        <Link href="#">Let&apos;s Talk.</Link>
                    </p>
                </div>

                <div className="tp-portfolio-slider__mail d-none d-sm-block">
                    <Link href="mailto:agntix@gmail.com">agntix@gmail.com</Link>
                </div>

                <div className="tp-portfolio-slider__social d-none d-sm-block">
                    <Link href="#">Fb</Link>{" "}
                    <Link href="#">In</Link>{" "}
                    <Link href="#">Be</Link>
                </div>

                {/* BG Slider */}
                <div
                    className="tp-portfolio-slider__wrap slider slider--bg"
                    ref={sliderBGRef}
                >
                    {portfolioThumbSliderItems.map((item) => (
                        <div key={`bg-${item.id}`} className="tp-portfolio-slider__item">
                            <div
                                className="tp-portfolio-slider__item-inner"
                                style={{ backgroundImage: `url(${item.image})` }}
                            />
                        </div>
                    ))}
                </div>

                {/* FG Slider */}
                <div
                    className="tp-portfolio-slider__wrap tp-portfolio-slider-small__wrap slider slider--fg"
                    ref={sliderFGRef}
                >
                    {portfolioThumbSliderItems.map((item) => (
                        <div key={`fg-${item.id}`} className="tp-portfolio-slider__item">
                            <div
                                className="tp-portfolio-slider__item-inner"
                                style={{ backgroundImage: `url(${item.smallImage})` }}
                            />
                        </div>
                    ))}
                </div>

                {/* Titles */}
                <div className="tp-portfolio-slider-type">
                    {portfolioThumbSliderItems.map((item, index) => (
                        <div
                            key={`title-${item.id}`}
                            className="type__item"
                            ref={(el) => {
                                if (el) titlesRef.current[index] = el;
                            }}
                        >
                            <h4 className="tp-portfolio-slider-type-title">
                                <Link href={item.link}>{item.name}</Link>
                            </h4>
                        </div>
                    ))}
                </div>

                {/* Navigation */}
                <nav className="slider-nav mb-80">
                    <button
                        ref={prevBtnRef}
                        className="slider-nav__item slider-nav__item--prev d-flex align-items-center ml-100"
                        aria-label="Previous slide"
                    >
                        <span className="icon-1">
                            <ArrowNextPrevIcon direction="left" />
                        </span>
                        <span className="slider-nav-text ml-5">Prev</span>
                    </button>

                    <button
                        ref={nextBtnRef}
                        className="slider-nav__item slider-nav__item--next d-flex align-items-center mr-100"
                        aria-label="Next slide"
                    >
                        <span className="slider-nav-text mr-5">Next</span>
                        <span className="icon-2">
                            <ArrowNextPrevIcon direction="right" />
                        </span>
                    </button>
                </nav>
            </div>
        </main>
    );
};

export default PortfolioWebglClient;
