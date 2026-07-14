import ImageHoverRevealProvider from '@/provider/ImageHoverRevealProvider';
import { AwardArrowIcon } from '@/svg/ArrowIcon';
import { awardDt } from '@/types/custom-dt';
import React from 'react';

const CreativeAAwardItem: React.FC<awardDt> = ({ year, title, position, image }) => {
    return (
        <ImageHoverRevealProvider>
            <div className="tp_fade_anim">
                <div className="ca-award-item hover-reveal-item p-relative mb-5">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="ca-award-box-left z-index-3">
                                <span className="ca-award-year">{year}</span>
                                <span className="ca-award-text">{title}</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="ca-award-box-right z-index-3 d-flex justify-content-between align-items-center">
                                <span className="ca-award-position">{position}</span>
                                <span className="ca-award-icon">
                                    <AwardArrowIcon />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div
                        className="tp-award-reveal-img"
                        style={{ backgroundImage: `url(${image})` }}
                    ></div>
                </div>
            </div>
        </ImageHoverRevealProvider>
    );
};

export default CreativeAAwardItem;