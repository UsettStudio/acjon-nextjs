"use client"
import { project_swiper_params, text_swiper_params } from '@/constants/swiper';
import DigitalMProjectItem from './subComponents/DigitalMProjectItem';
import { Swiper, SwiperSlide } from 'swiper/react';
import projectData from '@/data/projectData';
import Link from 'next/link';

const DigitalMarketingProject = () => {
    const textSlideItem = [
        "Grow Your Business",
        "with Digital Agency",
        "Drive Business Growth",
        "Grow Your Business",
        "with Digital Agency",
        "Drive Business Growth"
    ];

    const tabs = [
        { id: "all", label: "All", active: true },
        { id: "digital", label: "Digital" },
        { id: "branding", label: "Branding" },
        { id: "web", label: "Web" },
        { id: "marketing", label: "Marketing" },
    ];

    return (
        <div className="dgm-portfolio-ptb pt-120 pb-120" style={{ backgroundColor: "#010103" }}>
            {/* text slider */}
            <div className="dgm-portfolio-text-wrap">
                <div className="swiper-container dgm-portfolio-text-active">
                    <div className="swiper-wrapper slide-transtion">
                        <Swiper {...text_swiper_params}>
                            {textSlideItem.map((item, index) => (
                                <SwiperSlide key={index}>
                                    <div className="dgm-portfolio-slider-item">
                                        <p>{item}</p>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>

            {/* tabs */}
            <div className="container container-1510">
                <div className="row">
                    <div className="col-xl-8">
                        <div className="dgm-portfolio-tab mb-80">
                            <ul role="tablist">
                                {tabs.map(({ id, label, active }) => (
                                    <li className="nav-tab-item" role="presentation" key={id}>
                                        <Link
                                            href={`#${id}`}
                                            className={active ? "active" : ""}
                                            data-bs-toggle="tab"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* tab content */}
            <div className="container-fluid">
                <div className="dgm-portfolio-slider-wrap">
                    <div className="tab-content p-relative">
                        {tabs.map(({ id, active }) => (
                            <div
                                key={id}
                                className={`tab-pane ${active ? "active show" : ""}`}
                                id={id}
                                role="tabpanel"
                            >
                                <Swiper className="dgm-portfolio-active" {...project_swiper_params}>
                                    {projectData.slice(4, 12).map((item, index) => (
                                        <SwiperSlide key={index}>
                                            <DigitalMProjectItem project={item} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalMarketingProject;
