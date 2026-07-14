import { ServiceItemDt } from '@/types/custom-dt';
import Link from 'next/link';
import React from 'react';

const DigitalMProcessItem: React.FC<ServiceItemDt> = ({ id, delay, svgIcon, num, title, description }) => {
    return (
        <div className="col-xl-3 col-lg-4 col-md-6" key={id}>
            <div className="dgm-step-item tp_fade_anim" data-delay={delay}>
                <div className="dgm-step-top mb-60 d-flex align-items-center justify-content-between">
                    <span className="dgm-step-icon">{svgIcon && React.createElement(svgIcon)}</span>
                    <i className="dgm-step-num">{num}</i>
                </div>
                <div className="dgm-step-content">
                    <h4 className="dgm-step-title">
                        <Link className="tp-line-black" href={`/service-details/${id}`}>{title}</Link>
                    </h4>
                    <p>{description}</p>
                </div>
            </div>
        </div>
    );
};

export default DigitalMProcessItem;