"use client";
import CorporateAPortfolioSliderItem from './subComponents/CorporateAPortfolioSliderItem';
import { project_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { projectDt } from '@/types/custom-dt';
import projectData from '@/data/projectData';
import Link from 'next/link';

const tabs = [
    { id: 'all', label: 'All Case', active: true },
    { id: 'digital', label: 'finance' },
    { id: 'branding', label: 'marketing' },
    { id: 'web', label: 'Business' },
];

const PortfolioSwiper = ({ projects }: { projects: projectDt[] }) => (
    <Swiper className="dgm-portfolio-active" {...project_swiper_params}>
        {projects.map((project, index) => (
            <SwiperSlide key={index}>
                <CorporateAPortfolioSliderItem {...project} />
            </SwiperSlide>
        ))}
    </Swiper>
);

const CorporateAgencyPortfolio = () => {
    const projects = projectData.slice(17, 25);

    return (
        <div className="cr-portfolio-area cr-portfolio-style pt-120 pb-120">
            <div className="container container-1510">
                <div className="cr-portfolio-top-wrap mb-60">
                    <div className="row align-items-end">
                        {/* Title */}
                        <div className="col-xl-6">
                            <div className="cr-portfolio-title-box">
                                <span className="tp-section-subtitle st-spacegro fs-16 st-dot tp-split-title">
                                    Our Portfolio
                                </span>
                                <h2 className="tp-section-title tl-spacegro fw-700 text-case-int mb-0 tp-split-title">
                                    Excellence through <br /> our services
                                </h2>
                            </div>
                        </div>
                        {/* Tabs */}
                        <div className="col-xl-6">
                            <div className="dgm-portfolio-tab text-xl-end">
                                <ul role="tablist">
                                    {tabs.map(({ id, label, active }) => (
                                        <li key={id} className="nav-tab-item" role="presentation">
                                            <Link
                                                href={`#${id}`}
                                                className={active ? 'active' : ''}
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
            </div>

            {/* Tab Content */}
            <div className="dgm-portfolio-slider-wrap">
                <div className="tab-content p-relative">
                    {tabs.map(({ id, active }) => (
                        <div
                            key={id}
                            className={`tab-pane ${active ? 'active show' : ''}`}
                            id={id}
                            role="tabpanel"
                        >
                            <PortfolioSwiper projects={projects} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CorporateAgencyPortfolio;
