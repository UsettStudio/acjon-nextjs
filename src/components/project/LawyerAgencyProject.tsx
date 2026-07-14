"use client";
import LawyerAgencyProjectItem from './subComponents/LawyerAgencyProjectItem';
import { lw_project_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import projectData from '@/data/projectData';
import { ArrowIconSeven } from '@/svg';
import Link from 'next/link';

const LawyerAgencyProject = () => {
    return (
        <div className="lw-project-ptb pt-120 pb-120">
            <div className="container container-1510">
                {/* Section Header */}
                <div className="lw-project-title-wrap mb-45">
                    <div className="row align-items-end">
                        <div className="col-xl-6">
                            <div className="lw-project-title-box">
                                <span className="lw-section-subtitle mb-15">
                                    <i className="fa-light fa-gavel"></i>Our Latest Case Study
                                </span>
                                <h4 className="tp-section-title title-playfair tp-split-title">
                                    Excellence in Every <span>project</span>
                                </h4>
                            </div>
                        </div>
                        <div className="col-xl-6">
                            <div className="lw-project-btn text-xl-end">
                                <Link
                                    className="tp-btn-radius d-inline-flex align-items-center justify-content-between"
                                    href="/project-two-colum"
                                >
                                    <span>
                                        <span className="text-1">See All</span>
                                        <span className="text-2">See All</span>
                                    </span>
                                    <i>
                                        <span>
                                            <ArrowIconSeven />
                                            <ArrowIconSeven />
                                        </span>
                                    </i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slider */}
                <div className="lw-project-slider p-relative">
                    <div className="lw-service-2-active">
                        <Swiper
                            {...lw_project_swiper_params}
                        >
                            {projectData.slice(49, 55).map((item) => (
                                <SwiperSlide key={item.id}>
                                    <LawyerAgencyProjectItem item={item} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <div className="lw-project-dot"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerAgencyProject;
