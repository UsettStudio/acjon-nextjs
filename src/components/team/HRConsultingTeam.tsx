"use client";
import HRConsultingTeamItem from './subComponents/HRConsultingTeamItem';
import { ArrowIconSeven, ArrowIconTwelve } from '@/svg';
import { hr_team_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ShapeTitleLine } from '@/svg/ShapeIcons';
import teamMembers from '@/data/teamData';
import Link from 'next/link';

const HRConsultingTeam = () => {
    return (
        <div className="hr-team-ptb hr-team-style pt-120 pb-120 pl-160 pr-160 z-index-1" style={{ backgroundColor: "#fff" }}>
            <div className="hr-team-top mb-60">
                <div className="row align-items-end">
                    <div className="col-xl-6 col-lg-8">
                        <div className="hr-service-title-box">
                            <span className="tp-section-subtitle st-dot st-border tp_fade_anim" data-delay=".3">
                                Who we are
                            </span>
                            <h4 className="tp-section-title tl-spacegro text-case-int tp-split-title">
                                Tailored Solutions for <br /> Every
                                <span className="p-relative">
                                    Challenge.
                                    <ShapeTitleLine />
                                </span>
                            </h4>
                        </div>
                    </div>
                    <div className="col-xl-6 col-lg-4">
                        <div className="hr-team-arrow text-lg-end tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                            <button className="hr-team-prev">
                                <span>
                                    <ArrowIconTwelve direction='left' />
                                </span>
                            </button>{" "}
                            <button className="hr-team-next">
                                <span>
                                    <ArrowIconTwelve direction='right' />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hr-team-slider-wrap tp_fade_anim" data-delay=".5">
                <div className="swiper hr-team-active">
                    <div className="swiper-wrapper">
                        <Swiper
                            {...hr_team_params}
                        >
                            {teamMembers.slice(17, 22).map((member) => (
                                <SwiperSlide key={member.id}>
                                    <HRConsultingTeamItem {...member} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-xl-12">
                    <div className="hr-team-link mt-30 text-center tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                        <Link href="/team" className="tp-btn-green btn-h-60 br-8 tp-btn-anim">
                            <div className="tp-btn-text">See All Team</div>
                            <span>
                                <ArrowIconSeven />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRConsultingTeam;