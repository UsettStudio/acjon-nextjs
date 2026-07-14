"use client";
import DesignStudioPricingCard from './subComponents/DesignStudioPricingCard';
import { pricingData } from '@/data/pricingData';
import { PricingPlan } from '@/types/custom-dt';
import React from 'react';

const PricingSection: React.FC<{ plans: PricingPlan[] }> = ({ plans }) => {
    return (
        <div className="row">
            {plans.map((plan) => (
                <DesignStudioPricingCard key={plan.id} plan={plan} />
            ))}
        </div>
    );
};

// Tilleggsvalg – gjelder alle pakker
const addOns = [
    {
        title: '2D salgstegninger',
        desc: 'Plantegninger for salg – pris per plan.',
        price: '1 500 kr',
        period: '/plan',
    },
    {
        title: 'AI-generert sesongbilde',
        desc: 'Sommer, høst, vinter eller vår – laget av et allerede generert bilde.',
        price: '3 000 kr',
        period: '/bilde',
    },
    {
        title: 'AI-generert animasjon',
        desc: '6 sekunder animasjon av prosjektet ditt.',
        price: '4 500 kr',
        period: '/animasjon',
    },
];

const AddOnsSection: React.FC = () => {
    return (
        <div className="ds-addons-wrap">
            <div className="ds-addons-head text-center">
                <h4 className="ds-addons-title">Tilleggsvalg til alle pakker</h4>
                <p>Skreddersy prosjektet ditt med valgfrie tillegg.</p>
            </div>
            <div className="row justify-content-center">
                {addOns.map((item, index) => (
                    <div className="col-lg-4 col-md-6" key={index}>
                        <div className="ds-addon-item">
                            <div className="ds-addon-item-info">
                                <h5>{item.title}</h5>
                                <p>{item.desc}</p>
                            </div>
                            <div className="ds-addon-item-price">
                                <span>{item.price}</span>
                                <i>{item.period}</i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Component
const DesignStudioPrice: React.FC = () => {
    return (
        <div className="ds-price-area pt-150 pb-90" style={{ backgroundColor: "#010103" }}>
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ds-price-heading text-center mb-70">
                            <h3 className="tp-section-title tl-unbounded tp-split-title">
                                Velg pakken som <br />
                                passer prosjektet ditt
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="tp-tab-item">
                    <PricingSection plans={pricingData.yearly} />
                </div>

                <AddOnsSection />
            </div>
        </div>
    );
};

export default DesignStudioPrice;
