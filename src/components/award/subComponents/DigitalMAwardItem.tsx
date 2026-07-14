import { awardDt } from '@/types/custom-dt';
import { CroseIconTwo } from '@/svg';
import React from 'react';

const DigitalMAwardItem: React.FC<awardDt> = ({ number, title, count, image }) => {
    return (
        <div className="sa-award-item-wrap hover-reveal-item p-relative">
            <div className="sa-award-item d-flex align-items-center justify-content-between">
                <div className="sa-award-item-left d-flex align-items-center">
                    <span>{number}</span>
                    <h4 className="sa-award-item-title">{title}</h4>
                </div>
                <div className="sa-award-item-right">
                    <span>
                        <CroseIconTwo /> {count}
                    </span>
                </div>
            </div>
            <div
                className="tp-award-reveal-img" style={{ backgroundImage: `url(${image})` }}
            ></div>
        </div>
    );
};

export default DigitalMAwardItem;