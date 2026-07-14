import { ArrowIconTwo } from '@/svg';
import { ServiceItemDt } from '@/types/custom-dt';
import Link from 'next/link';
import React from 'react';

interface digitalMarketingProps {
    service: ServiceItemDt
}

const DigitalMServiceItem: React.FC<digitalMarketingProps> = ({ service }) => {
    return (
        <div className="dgm-service-item">
            <span className="dgm-service-icon">{service.svgIcon && <service.svgIcon />}</span>
            <div className="dgm-service-content">
                <h4 className="dgm-service-title">
                    <Link className="tp-line-white" href={`/service-details/${service.id}`}>
                        {service.title}
                    </Link>
                </h4>
                <p>{service.description}</p>
            </div>
            <div className="dgm-service-link">
                <Link
                    className="tp-btn-anim tp-doubble-effect"
                    href={`/service-details/${service.id}`}
                >
                    <div className="tp-btn-text">View Details</div>
                    <i>
                        <ArrowIconTwo />
                        <ArrowIconTwo />
                    </i>
                </Link>
            </div>
        </div>
    );
};

export default DigitalMServiceItem;