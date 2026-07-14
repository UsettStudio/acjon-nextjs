"use client";
import CorporateAPortfolioSliderItem from '../portfolio/subComponents/CorporateAPortfolioSliderItem';
import { ca_project_active } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import projectData from '@/data/projectData';
import { ButtonArrowIconTwo } from '@/svg';

const CreativeAgencyProject = () => {
    return (
        <section className="ca-project-ptb pb-110">
            <div className="container">
                {/* Section Header */}
                <div className="row align-items-end">
                    <div className="col-lg-6">
                        <div className="ca-project-text-box mb-60">
                            <span className="tp-section-subtitle title-white tp-split-title">{`// Latest Project`}</span>
                            <h3 className="tp-section-title tl-unbounded title-white tp-split-title">Latest Project</h3>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div
                            className="ca-project-right text-lg-end mb-60 tp_fade_anim"
                            data-delay=".5"
                            data-fade-from="top"
                            data-ease="bounce"
                        >
                            <div className="ca-project-arrows">
                                <button className="ca-project-prev">
                                    <span>
                                        <ButtonArrowIconTwo direction="left" />
                                    </span>
                                </button>
                                <button className="ca-project-next">
                                    <span>
                                        <ButtonArrowIconTwo direction="right" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Slider */}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ca-project-wrapper tp_fade_anim" data-delay=".4">
                            <div className='ca-project-active'>
                                <Swiper
                                    {...ca_project_active}
                                >
                                    {projectData.slice(12, 17).map((project, index) => (
                                        <SwiperSlide key={project.id}>
                                            <CorporateAPortfolioSliderItem {...project} key={index} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CreativeAgencyProject;
