"use client";
import AnimatedCounter from '../shared/Counter/AnimatedCounter';
import { text_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CheckIcon } from '@/svg/CheckIcons';
import { ArrowIconFive } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const CorporateAgencyChoose = () => {
    const chooseList = [
        'Years of experience <br /> delivering.',
        'Partnered with top <br /> tier global.',
        'Maximizing value for <br /> every dollar spent.',
        'A passionate team <br /> committed.',
    ];

    const sliderTexts = Array(10).fill(
        <>
            <span>Immediate Hiring</span> Business development manager, Ranch view
            California. <Link href="#">Explore More</Link>
        </>
    );

    return (
        <div
            className="cr-choose-area cr-choose-ptb z-index-1 pt-120 pb-120"
            style={{ backgroundColor: '#ECF8F8' }}
        >
            <div className="cr-choose-thumb-wrapper z-index-1">
                <div className="bnc-choose-thumb fix p-relative">
                    <Image width={838} height={928} className="anim-zoomin"
                        src="/assets/img/corporate-agency/banner/choose-us-thumb.jpg" alt="choose thumb" />
                </div>
            </div>
            <div className="container container-1510">
                <div className="row">
                    <div className="offset-xl-5 col-xl-7 col-lg-12">
                        <div className="cr-choose-wrapper pl-70 pb-60">
                            <div className="cr-choose-title-box">
                                <span className="tp-section-subtitle st-spacegro fs-16 st-dot tp-split-title">
                                    why Choose Us
                                </span>
                                <h2 className="tp-section-title fs-60 tl-spacegro fw-700 text-case-int mb-25 tp-split-title">
                                    Crafting digital experiences <br /> that the inspire.
                                </h2>
                                <div className="cr-choose-review-box d-flex justify-content-between">
                                    <div className="cr-choose-review d-flex">
                                        <div className="cr-choose-review-thumb">
                                            <Image width={165} height={62} src="/assets/img/corporate-agency/banner/choose-us-thumb-2.jpg" alt="avater" />
                                        </div>
                                        <div className="cr-choose-review-content">
                                            <AnimatedCounter min={1} max={18} />
                                            <span>K+</span>
                                            <p>customers word- wide</p>
                                        </div>
                                    </div>
                                    <div className="cr-choose-review-shape">
                                        <Image width={64} height={64} src="/assets/img/corporate-agency/banner/choose-us-shape-1.png" alt="shape" />
                                    </div>
                                </div>
                            </div>
                            <div className="cr-choose-list">
                                <div className="row row-cols-md-2 row-cols-1">
                                    {chooseList.map((item, idx) => (
                                        <div className="col" key={idx}>
                                            <span className="cr-choose-list-title">
                                                <i>
                                                    <CheckIcon />
                                                </i>
                                                {item.split('<br />').map((part, i) => (
                                                    <React.Fragment key={i}>
                                                        {part}
                                                        {i < item.split('<br />').length - 1 && <br />}
                                                    </React.Fragment>
                                                ))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="cr-choose-btn">
                                <Link
                                    className="tp-btn-green bdr-5 fw-700 ff-space tp-btn-anim"
                                    href="/about"
                                >
                                    <div className="tp-btn-text">read More</div>
                                    <span>
                                        <ArrowIconFive />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="cr-choose-slider-wrapper">
                <div className="tp-text-slider-active fix swiper-container">
                    <div className="slide-transtion">
                        <Swiper
                            {...text_swiper_params}
                        >
                            {sliderTexts.map((text, idx) => (
                                <SwiperSlide key={idx}>
                                    <div className="cr-choose-slider-text">
                                        <p>{text}</p>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateAgencyChoose;
