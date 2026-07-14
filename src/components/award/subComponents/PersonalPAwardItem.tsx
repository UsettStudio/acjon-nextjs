import { AwardDT } from '@/types/custom-dt';
import React from 'react';

const PersonalPAwardItem: React.FC<AwardDT> = ({ title, role, date }) => {
    return (
        <div className="tp-about-me-experience-ex">
            <div className="tp-about-me-experience-ex-content">
                <h4 className="tp-about-me-experience-ex-title">
                    {title}
                </h4>
                <p>{role}</p>
            </div>
            <div className="tp-about-me-experience-ex-date">
                <span>{date}</span>
            </div>
        </div>
    );
};

export default PersonalPAwardItem;