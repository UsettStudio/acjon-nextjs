import { ServiceItemDt } from '@/types/custom-dt';
import { ArrowIconFive } from '@/svg';
import Link from 'next/link';
import React from 'react';

const BusinessCServiceItem: React.FC<ServiceItemDt> = ({ delay, svgIcon, title, description, id, num }) => {
    return (
        <div className="col-xl-4 col-lg-6 tp_fade_anim"
            data-delay={delay}
        >
            <div className="bnc-service-item mb-30">
                <div className="bnc-service-item-icon">
                    <span>{svgIcon && React.createElement(svgIcon)}</span>
                </div>

                <div className="bnc-service-item-content">
                    <div className="bnc-service-item-wrap">
                        <h4 className="bnc-service-item-title">
                            <Link className="tp-line-black" href={`/service-details/${id}`}
                                dangerouslySetInnerHTML={{ __html: title }}
                            />
                        </h4>
                        <div className="bnc-service-item-text">
                            <p>{description}</p>
                        </div>
                    </div>

                    <div className="bnc-service-item-btn-box z-index-1 d-flex justify-content-between align-items-center">
                        <div className="bnc-service-item-btn">
                            <Link
                                className="tp-btn-green bdr-5 fw-700 ff-bricolage bg-none-style tp-btn-anim"
                                href={`/service-details/${id}`}
                            >
                                <div className="tp-btn-text">Read More</div>
                                <span>
                                    <ArrowIconFive />
                                </span>
                            </Link>
                        </div>
                        <div className="bnc-service-item-number">
                            <span>{num}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessCServiceItem;