"use client";
import Image from "next/image";
import Link from "next/link";
import {
    RecruitmentTargetIcon,
    TrainingGrowthIcon,
    PolicyGearIcon,
    SuccessionCycleIcon,
} from "@/svg/ChooseIcons";
import { ShapeTitleLine } from "@/svg/ShapeIcons";
import { ArrowIconSeven } from "@/svg";
import { Swiper, SwiperSlide } from "swiper/react";
import { portfolio_text_swiper_params } from "@/constants/swiper";

const chooseItems = [
    {
        id: 1,
        icon: <RecruitmentTargetIcon />,
        title: "Talent Acquisition",
        desc: "Our dedication to quality over quantity has earned us the trust of clients who value precision.",
    },
    {
        id: 2,
        icon: <TrainingGrowthIcon />,
        title: "Employee Training",
        desc: "Our dedication to quality over quantity has earned us the trust of clients who value precision.",
    },
    {
        id: 3,
        icon: <PolicyGearIcon />,
        title: "HR Compliance",
        desc: "Our dedication to quality over quantity has earned us the trust of clients who value precision.",
    },
    {
        id: 4,
        icon: <SuccessionCycleIcon />,
        title: "Succession Planning",
        desc: "Our dedication to quality over quantity has earned us the trust of clients who value precision.",
    },
];

const sliderTexts = [
    "HR Business Consulting *",
    "HR Business Consulting *",
    "HR Business Consulting *",
    "HR Business Consulting *",
    "HR Business Consulting *",
    "HR Business Consulting *",
];

const HRConsultingChooseArea = () => {
    return (
        <div className="hr-choose-area hr-gradient-bg z-index-1 pt-105">
            <div className="hr-choose-main pr-160">
                <div className="row align-items-end">
                    {/* Left Column */}
                    <div className="col-xl-6">
                        <div className="hr-choose-title-box pl-160 mb-50">
                            <span
                                className="tp-section-subtitle st-dot st-border white-style tp_fade_anim"
                                data-delay=".3"
                            >
                                Why choose Us
                            </span>
                            <h4 className="tp-section-title tl-spacegro text-case-int text-white tp-split-title">
                                HR Solutions <br /> Built on{" "}
                                <span className="clr p-relative">
                                    Trusted.
                                    <ShapeTitleLine />
                                </span>
                            </h4>
                        </div>

                        <div className="hr-choose-thumb fix fix tp-clip-anim">
                            <Image
                                width={672}
                                height={464}
                                className="w-100 tp-anim-img"
                                data-animate="true"
                                data-speed=".8"
                                src="/assets/img/hr-consulting/choose/choose-1.jpg"
                                alt="HR consulting choose section image"
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-xl-6">
                        <div className="hr-choose-item-wrap pl-60 mb-65">
                            <div className="row row-cols-sm-2 row-cols-1">
                                {chooseItems.map((item) => (
                                    <div className="col" key={item.id}>
                                        <div className="hr-choose-item mb-60">
                                            <span className="hr-choose-icon">{item.icon}</span>
                                            <h4 className="hr-choose-title">{item.title}</h4>
                                            <p>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="hr-choose-btn-wrap tp_fade_anim"
                                data-delay=".5"
                                data-fade-from="top"
                                data-ease="bounce"
                            >
                                <Link
                                    href="/service"
                                    className="tp-btn-green btn-h-60 br-8 tp-btn-anim"
                                >
                                    <div className="tp-btn-text">Read more</div>
                                    <span>
                                        <ArrowIconSeven />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slider Text Section */}
            <div className="dgm-portfolio-text-wrap hr-choose-style">
                <div className="swiper dgm-portfolio-text-active">
                    <div className="swiper-wrapper slide-transtion">
                        <Swiper
                            {...portfolio_text_swiper_params}
                        >
                            {sliderTexts.map((text, index) => (
                                <SwiperSlide key={index}>
                                    <div className="dgm-portfolio-slider-item">
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

export default HRConsultingChooseArea;
