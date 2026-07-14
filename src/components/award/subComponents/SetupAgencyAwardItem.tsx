import { awardDt } from '@/types/custom-dt';
import { CroseIconTwo } from '@/svg';
import Image from 'next/image';
import React from 'react';

const SetupAgencyAwardItem: React.FC<awardDt> = ({ id, label, title, count, image }) => {
    return (
        <div className="sa-award-item d-flex align-items-center justify-content-between">
            <div className="sa-award-item-left d-flex align-items-center">
                <span>{label}</span>
                <h4 className="sa-award-item-title">{title}</h4>
            </div>
            <div className="sa-award-item-right d-flex align-items-center">
                <span>
                    <CroseIconTwo />{" "}
                    {count}
                </span>
                <div className="sa-award-item-icon">
                    <Image width={60} height={60} src={image} alt={`award-icon-${id}`} />
                </div>
            </div>
        </div>
    );
};

export default SetupAgencyAwardItem;