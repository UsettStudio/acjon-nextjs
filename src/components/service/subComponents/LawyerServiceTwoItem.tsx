import { ServiceItemDt } from '@/types/custom-dt';
import { ArrowIconThirteen } from '@/svg';
import Link from 'next/link';
import React from 'react';

const LawyerServiceTwoItem: React.FC<ServiceItemDt> = ({ id, num, svgIcon, title, description }) => {
    return (
        <div className="lw-service-2-item text-center mb-60">
            <div className="lw-service-2-number text-start">
                <span>{num}</span>
            </div>

            <div className="lw-service-2-content">
                <span className="lw-service-2-icon">{svgIcon && React.createElement(svgIcon)}</span>
                <h4 className="lw-service-2-title">
                    <Link className="tp-line-white" href={`/service-details/${id}`}>
                        {title}
                    </Link>
                </h4>
                <div className="lw-service-2-text">
                    <p>{description}</p>
                </div>
            </div>
            <div className="lw-service-2-link">
                <Link href={`/service-details/${id}`}>
                    <ArrowIconThirteen />
                </Link>
            </div>
        </div>
    );
};

export default LawyerServiceTwoItem;