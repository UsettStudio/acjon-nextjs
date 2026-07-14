import { ButtonArrowIcon } from '@/svg/ArrowIcon';
import { ServiceItemDt } from '@/types/custom-dt';
import Link from 'next/link';
import React from 'react';

const StartupAServiceItem: React.FC<ServiceItemDt> = ({ id, title, svgIcon, description }) => {
    return (
        <div className="sa-service-item p-relative mb-30">
            <div className="sa-service-item-icon">
                <span>
                    {svgIcon && React.createElement(svgIcon)}
                </span>
            </div>
            <div className="sa-service-item-content">
                <h4 className="sa-service-item-title">
                    <Link className="tp-line-white" href={`/service-details/${id}`}>
                        {title}
                    </Link>
                </h4>
                <p>{description}</p>
                <div className="ds-service-item-btn tp-btn-anim">
                    <Link href={`/service-details/${id}`}>
                        <div className="tp-btn-text">Read More</div>
                        <span className="ds-service-item-btn-icon">
                            <ButtonArrowIcon />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StartupAServiceItem;