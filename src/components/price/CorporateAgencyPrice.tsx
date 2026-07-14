"use client";
import { CheckIconTwo } from '@/svg/CheckIcons';
import { PricingPlan } from '@/types/custom-dt';
import React, { useState } from 'react';
import Link from 'next/link';

const CorporateAgencyPrice: React.FC = () => {
    const [isYearly, setIsYearly] = useState<boolean>(true);

    const pricingPlans: PricingPlan[] = [
        {
            id: 'basic',
            name: 'Basic',
            description: 'Ideal for small businesses of startups.',
            monthlyPrice: '$00',
            yearlyPrice: '$19',
            features: [
                'Basic Branding Package',
                'Custom 5-Page Website',
                'SEO Optimization Basics',
                'Full Brand Strategy & Design',
                'Social Media Setup'
            ]
        },
        {
            id: 'standard',
            name: 'Standard',
            description: 'Ideal for small businesses of startups.',
            monthlyPrice: '$55',
            yearlyPrice: '$79',
            isPopular: true,
            features: [
                'Basic Branding Package',
                'Custom 5-Page Website',
                'SEO Optimization Basics',
                'Full Brand Strategy & Design',
                'On-Demand Design Revisions'
            ]
        },
        {
            id: 'advanced',
            name: 'advanced',
            description: 'Ideal for small businesses of startups.',
            monthlyPrice: '$79',
            yearlyPrice: '$99',
            features: [
                'Basic Branding Package',
                'Custom 5-Page Website',
                'SEO Optimization Basics',
                'Full Brand Strategy & Design',
                'On-Demand Design Revisions'
            ]
        }
    ];

    const handleToggle = () => {
        setIsYearly(!isYearly);
    };

    const handleLabelClick = (yearly: boolean) => {
        setIsYearly(yearly);
    };

    return (
        <div className="cr-price-ptb pt-150 pb-90" style={{ backgroundColor: "#093535" }}>
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ds-price-heading text-center mb-50">
                            <h3 className="tp-section-title tl-spacegro tp-split-title">
                                Special offer! choose <br />
                                your pack today
                            </h3>
                        </div>
                        <div className="tp-pricing-nav-wrapper cr-nav p-relative mb-70">
                            <label
                                className={`tp-toggler-pre ${!isYearly ? 'is-active' : ''}`}
                                id="tp-nav-monthly"
                                onClick={() => handleLabelClick(false)}
                            >
                                Monthly
                            </label>
                            <div className="tp-toggle-input-wrap">
                                <input
                                    type="checkbox"
                                    id="tp-switcher-input"
                                    className="tp-input-check"
                                    checked={isYearly}
                                    onChange={handleToggle}
                                />
                                <b className="tp-switch-toggle"></b>
                            </div>
                            <label
                                className={`tp-toggler-post ${isYearly ? 'is-active' : ''}`}
                                id="tp-nav-yearly"
                                onClick={() => handleLabelClick(true)}
                            >
                                Yearly
                            </label>
                        </div>
                    </div>
                </div>

                {/* Monthly Plans */}
                <div id="tp-tab-monthly" className={`tp-tab-item ${!isYearly ? '' : 'tp-tab-hide'}`}>
                    <div className="row">
                        {pricingPlans.map((plan) => (
                            <div key={`monthly-${plan.id}`} className="col-xl-4 col-md-6">
                                <div className={`ds-price-item mb-30 ${plan.isPopular ? 'active' : ''}`}>
                                    {plan.isPopular && (
                                        <div className="ds-price-item-tag"><span>popular</span></div>
                                    )}
                                    <div className="ds-price-item-head">
                                        <span>{plan.name}</span>
                                        <p>{plan.description}</p>
                                        <h4>{plan.monthlyPrice} <i>/Free</i></h4>
                                    </div>
                                    <div className="ds-price-item-list">
                                        <h4 className="ds-price-item-list-title">Includes:</h4>
                                        <ul>
                                            {plan.features.map((feature, index) => (
                                                <li key={index}>
                                                    <span>
                                                        <CheckIconTwo />
                                                    </span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="ds-price-item-btn">
                                        <Link className="tp-btn-green btn-h-60 tp-btn-anim" href="/contact-us">
                                            <div className="tp-btn-text">
                                                Choose your plan
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Yearly Plans */}
                <div id="tp-tab-yearly" className={`tp-tab-item ${isYearly ? '' : 'tp-tab-hide'}`}>
                    <div className="row">
                        {pricingPlans.map((plan) => (
                            <div key={`yearly-${plan.id}`} className="col-xl-4 col-md-6">
                                <div className={`ds-price-item mb-30 ${plan.isPopular ? 'active' : ''}`}>
                                    {plan.isPopular && (
                                        <div className="ds-price-item-tag"><span>popular</span></div>
                                    )}
                                    <div className="ds-price-item-head">
                                        <span>{plan.name}</span>
                                        <p>{plan.description}</p>
                                        <h4>{plan.yearlyPrice} <i>/Yearly</i></h4>
                                    </div>
                                    <div className="ds-price-item-list">
                                        <h4 className="ds-price-item-list-title">Includes:</h4>
                                        <ul>
                                            {plan.features.map((feature, index) => (
                                                <li key={index}>
                                                    <span>
                                                        <CheckIconTwo />
                                                    </span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="ds-price-item-btn">
                                        <Link className="tp-btn-green btn-h-60 tp-btn-anim" href="/contact-us">
                                            <div className="tp-btn-text">
                                                Choose your plan
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateAgencyPrice;