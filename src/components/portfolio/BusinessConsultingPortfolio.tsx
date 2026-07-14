"use client";
import BusinessCPortfolioItem from './subComponents/BusinessCPortfolioItem';
import { portfolio_slider_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { TestimonialArrowIcon } from '@/svg';
import projectData from '@/data/projectData';

const BusinessConsultingPortfolio = () => {
    return (
        <div className="bnc-portfolio-area bnc-portfolio-ptb pt-30 pb-150">
            <div className="container container-1510">
                <div className="row align-items-end">
                    <div className="col-xl-6 col-lg-8">
                        <div className="bnc-portfolio-title-box pb-70">
                            <span className="tp-section-subtitle fs-16 st-dot tp-split-title">Our Latest Portfolio</span>
                            <h3 className="tp-section-title fs-72 tp-split-title">Bringing Ideas to<br/>Life Our Latest Projects</h3>
                        </div>
                    </div>
                    <div className="col-xl-6 col-lg-4">
                        <div className="bnc-portfolio-slider-arrow pb-90 tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                            <button className="tp-portfolio-prev">
                                <span>
                                    <TestimonialArrowIcon direction='left' />
                                </span>
                            </button>
                            <button className="tp-portfolio-next">
                                <span>
                                    <TestimonialArrowIcon direction='right' />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bnc-portfolio-slider-wrapper tp_fade_anim" data-delay=".5">
                <div className="tp-portfolio-active swiper">
                    <Swiper
                        {...portfolio_slider_params}
                    >
                        {
                            projectData.slice(35, 40).map((item, index) => (
                                <SwiperSlide key={index}>
                                    <BusinessCPortfolioItem {...item} key={index} />
                                </SwiperSlide>
                            ))
                        }
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default BusinessConsultingPortfolio;