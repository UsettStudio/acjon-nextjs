"use client";
import LawyerAgencyPricingCard from './subComponents/LawyerAgencyPricingCard';
import { pricingData } from '@/data/pricingData';
import { PricingPlan } from '@/types/custom-dt';
import React, { useState } from 'react';
import Image from 'next/image';

const PricingToggle: React.FC<{
    isYearly: boolean;
    onToggle: (isYearly: boolean) => void;
}
> = ({ isYearly, onToggle }) => {
    return (
        <div className="tp-pricing-nav-wrapper cr-nav p-relative mb-70">
            <label
                className={`tp-toggler-pre ${!isYearly ? 'is-active' : ''}`}
                onClick={() => onToggle(false)}
            >
                Monthly
            </label>
            <div className="tp-toggle-input-wrap">
                <input
                    type="checkbox"
                    id="tp-switcher-input"
                    className="tp-input-check"
                    checked={isYearly}
                    onChange={(e) => onToggle(e.target.checked)}
                />
                <b className="tp-switch-toggle"></b>
            </div>
            <label
                className={`tp-toggler-post ${isYearly ? 'is-active' : ''}`}
                onClick={() => onToggle(true)}
            >
                Yearly
            </label>
        </div>
    );
};

const PricingSection: React.FC<{ plans: PricingPlan[] }> = ({ plans }) => {
    return (
        <div className="row">
            {plans.map((plan) => (
                <LawyerAgencyPricingCard key={plan.id} plan={plan} />
            ))}
        </div>
    );
};

// Main Component
const DesignStudioPrice: React.FC = () => {
    const [isYearly, setIsYearly] = useState<boolean>(true);

    return (
        <div className="lw-pricing-ptb p-relative pt-150 pb-120">
            <div className="lw-pricing-shape">
                <Image className="img-fluid" width={1089} height={1886} src="/assets/img/lawyer-agency/testimonial/testimonial-shape.png" alt="shape image" />
            </div>
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="lw-pricing-title-box text-center mb-40">
                            <h3 className="tp-section-title title-playfair fs-52 tp-split-title">
                                Special offer! choose your <br />
                                pack <span> today</span>
                            </h3>
                        </div>
                    </div>

                    <PricingToggle
                        isYearly={isYearly}
                        onToggle={setIsYearly}
                    />
                </div>

                <div className={`tp-tab-item ${!isYearly ? 'tp-tab-hide' : ''}`}>
                    <div className='lw-pricing-wrapper'>
                        <PricingSection plans={pricingData.yearly} />
                    </div>
                </div>
                <div className={`tp-tab-item ${isYearly ? 'tp-tab-hide' : ''}`}>
                    <div className='lw-pricing-wrapper'>
                        <PricingSection plans={pricingData.monthly} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignStudioPrice;