import { CheckIconTwo } from '@/svg/CheckIcons';
import { PricingPlan } from '@/types/custom-dt';
import { enhetsNote, prisPrefiks } from '@/data/siteConfig';
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
                    {/*
                      «Fra» foran prisen. Pakkeprisene forutsetter en enkel
                      bygning; et mer komplisert bygg koster 500–1 000 kr mer
                      per bilde. Uten dette ordet leses tallet som en fastpris.
                    */}
                    <h4>
                        <i className="ds-price-item-fra">{prisPrefiks}</i>{" "}
                        {plan.price} <i>{plan.period}</i>
                    </h4>
                    {/*
                      Omfanget må stå rett under tallet. En pakkepris uten
                      grense blir lest som «dette koster prosjektet mitt»
                      uansett hvor stort prosjektet er – og det er ikke det
                      tallet dekker.
                    */}
                    <p className="ds-price-item-scope">{enhetsNote}</p>
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