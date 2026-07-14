import { CheckIconTwo } from '@/svg/CheckIcons';
import { PricingPlan } from '@/types/custom-dt';
import Link from 'next/link';
import React from 'react';

const DesignStudioPricingCard: React.FC<{ plan: PricingPlan }> = ({ plan }) => {
    return (
        <div className={`col-xl-4 col-md-6`}>
            <div className={`ds-price-item mb-30 ${plan.isPopular ? 'active' : ''}`}>
                {plan.isPopular && (
                    <div className="ds-price-item-tag">
                        <span>populær</span>
                    </div>
                )}

                <div className="ds-price-item-head">
                    <span>{plan.name}</span>
                    <p>{plan.description}</p>
                    <h4>{plan.price} <i>{plan.period}</i></h4>
                </div>

                <div className="ds-price-item-list">
                    <h4 className="ds-price-item-list-title">Inkluderer:</h4>
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
                    <Link className="tp-btn-green btn-h-60 tp-btn-anim" href="#kontakt-skjema">
                        <div className="tp-btn-text">
                            Velg pakke
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DesignStudioPricingCard;