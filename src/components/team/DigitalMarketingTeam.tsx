"use client"
import DigitalMarketingTeamItem from './subComponents/DigitalMarketingTeamItem';
import { text_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import teamMembers from '@/data/teamData';

const sliderTexts = [
    "Grow Your Business",
    "with Digital Agency -",
    "Drive Business Growth",
    "Grow Your Business",
    "with Digital Agency -",
    "Drive Business Growth"
];

const DigitalMarketingTeam = () => {
    return (
        <div className="dgm-team-ptb pt-100">
            {/* Slider Section */}
            <div className="dgm-team-slider-wrap mb-10">
                <Swiper
                    className='dgm-portfolio-text-active slide-transtion'
                    {...text_swiper_params}
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

            {/* Team Members */}
            <div className="container container-1510">
                <div className="row">
                    {teamMembers.slice(4, 8).map((item, index) => (
                        <DigitalMarketingTeamItem {...item} key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DigitalMarketingTeam;
