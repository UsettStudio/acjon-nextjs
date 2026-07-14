"use client";

import { useState } from "react";
import PricingCard from "./subComponents/PricingCard";
import { pricingDataTwo } from "@/data/pricingData";

const PricingArea = () => {
  const [isYearly, setIsYearly] = useState<boolean>(false);

  return (
    <div className="tp-pricing-ptb pt-200 pb-120">
      <div className="container container-1480">
        <div className="row">
          <div className="col-lg-12">

            {/* Heading */}
            <div className="tp-pricing-heading text-center mb-40">
              <span className="tp-section-subtitle tp_fade_anim" data-delay=".3">
                Acjon Plan
              </span>
              <h4 className="tp-section-title tp-split-title">
                Special Offer! choose your <br /> pack today
              </h4>
            </div>

            {/* Toggle */}
            <div className="tp-pricing-nav-wrapper p-relative mb-60">
              <label
                className={`tp-toggler-pre ${!isYearly ? "is-active" : ""}`}
                onClick={() => setIsYearly(false)}
              >
                Monthly
              </label>

              <div className="tp-toggle-input-wrap">
                <input
                  type="checkbox"
                  className="tp-input-check"
                  checked={isYearly}
                  onChange={(e) => setIsYearly(e.target.checked)}
                />
                <b className="tp-switch-toggle"></b>
              </div>

              <label
                className={`tp-toggler-post ${isYearly ? "is-active" : ""}`}
                onClick={() => setIsYearly(true)}
              >
                Yearly
              </label>
            </div>

            {/* Pricing Content */}
            <div className="tp-pricing-tab-item tp_fade_anim" data-delay=".3">
              <div className="row">
                {(isYearly
                  ? pricingDataTwo.yearly
                  : pricingDataTwo.monthly
                ).map((plan) => (
                  <PricingCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingArea;
