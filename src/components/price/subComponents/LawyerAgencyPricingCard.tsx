import { CheckIconTwo } from '@/svg/CheckIcons';
import { PricingPlan } from '@/types/custom-dt';
import { ArrowIconThirteen } from '@/svg';
import Link from 'next/link';
import React from 'react';

const LawyerAgencyPricingCard: React.FC<{ plan: PricingPlan }> = ({ plan }) => {
    return (
        <div className={`col-xl-4 col-md-6`}>
            <div className={`ds-price-item mb-30 ${plan.isPopular ? 'active' : ''}`}>
                {plan.isPopular && (
                    <div className="ds-price-item-tag">
                        <span>popular</span>
                    </div>
                )}

                <div className="ds-price-item-head">
                    <span>{plan.name}</span>
                    <h4>{plan.price} <i>{plan.period}</i></h4>
                </div>

                <div className="ds-price-item-list">
                    <h4 className="ds-price-item-list-title">Includes:</h4>
                    <ul>
                        {plan.features.map((feature, index) => (
                            <li key={index}>
                                <span>
                                    <CheckIconTwo />
                                </span>{" "}
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="ds-price-item-btn">
                    <Link className="tp-btn-green btn-h-60" href="/contact-us">
                        <div className="tp-btn-text">
                            Choose your plan {" "}
                            <span className="ml-5">
                                <ArrowIconThirteen />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LawyerAgencyPricingCard;