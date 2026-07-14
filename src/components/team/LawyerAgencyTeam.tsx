"use client";
import LawyerATeamItem from './subComponents/LawyerATeamItem';
import { lw_service_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ArrowIconThirteen } from '@/svg';
import teamMembers from '@/data/teamData';

const LawyerAgencyTeam = () => {
    return (
        <section
            className="lw-team-area hr-team-style p-relative pt-120 pb-120 fix"
            style={{ backgroundColor: "#0C1B1A" }}
        >
            <span className="lw-service-2-big-text">Our Team</span>

            <div className="container-fluid">
                <div className="row">
                    {/* Left Section */}
                    <div className="offset-xl-1 col-xl-4">
                        <div className="lw-service-title-wrap pl-50">
                            <div className="lw-service-title-box">
                                <span className="lw-section-subtitle mb-15">
                                    <i className="fa-light fa-gavel"></i>
                                    Our Team Member
                                </span>
                                <h4 className="tp-section-title title-playfair fs-52 mb-20 tp-split-title">
                                    Discover our latest <br /> legal expertise & <br /> <span>Our services</span>
                                </h4>
                                <p>
                                    We believe that every client has unique needs <br />
                                    and our services are designed.
                                </p>
                            </div>

                            {/* Slider Arrows */}
                            <div className="lw-service-arrow">
                                <button className="lw-service-prev">
                                    <ArrowIconThirteen direction="left" />
                                </button>
                                <button className="lw-service-next">
                                    <ArrowIconThirteen direction="right" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="col-xl-7">
                        <div className="lw-service-slider-wrap">
                            <Swiper
                                className='lw-service-active'
                                {...lw_service_swiper_params}
                            >
                                {teamMembers.slice(22, 29).map((team, index) => (
                                    <SwiperSlide key={index}>
                                        <LawyerATeamItem {...team} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LawyerAgencyTeam;
