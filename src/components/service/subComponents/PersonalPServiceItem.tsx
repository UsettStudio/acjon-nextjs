import { ServiceItemDt } from '@/types/custom-dt';
import { ArrowIconTwo } from '@/svg';
import Link from 'next/link';
import React from 'react';

const PersonalPServiceItem: React.FC<ServiceItemDt> = ({ id, title, num, categories, description }) => {
    return (
        <div className="tp-about-me-service-item">
            <div className="row align-items-center">
                {/* Left: Title & Categories */}
                <div className="col-lg-5">
                    <div className="tp-about-me-service-left">
                        <h4 className="tp-about-me-service-item-title">
                            <Link href={`/service-details/${id}`}>
                                {title} <span>{num}</span>
                            </Link>
                        </h4>
                        <div className="tp-about-me-service-item-categories">
                            {categories?.map((cat, index) => (
                                <span key={index}>{cat}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Middle: Description */}
                <div className="col-lg-5">
                    <div className="tp-about-me-service-item-text">
                        <p>
                            {description}
                            <br />
                        </p>
                    </div>
                </div>

                {/* Right: Arrow Icon */}
                <div className="col-lg-2">
                    <div className="tp-about-me-service-item-icon text-lg-end">
                        <Link href={`/service-details/${id}`}>
                            <span>
                                <ArrowIconTwo width='16' height='17' />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalPServiceItem;