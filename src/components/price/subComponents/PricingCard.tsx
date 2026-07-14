import { CheckIconTwo } from "@/svg/CheckIcons";
import { pricePlanDt } from "@/types/custom-dt";
import Link from "next/link";

const PricingCard = ({ plan }: { plan: pricePlanDt }) => {
    return (
        <div className="col-xl-4 col-md-6">
            <div className={`ds-price-item mb-30 ${plan.active ? "active" : ""}`}>
                {plan.popular && (
                    <div className="ds-price-item-tag">
                        <span>popular</span>
                    </div>
                )}

                <div className="ds-price-item-head">
                    <span>{plan.title}</span>
                    <p>{plan.desc}</p>
                    <h4>
                        {plan.price} <i>{plan.duration}</i>
                    </h4>
                </div>

                <div className="ds-price-item-list">
                    <h4 className="ds-price-item-list-title">Includes:</h4>
                    <ul>
                        {plan.features.map((feature, i) => (
                            <li key={i}>
                                <span>
                                    <CheckIconTwo />
                                </span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="ds-price-item-btn">
                    <Link
                        href="/contact-us"
                        className={`btn-h-60 tp-btn-anim w-100 text-center ${plan.active ? "tp-btn-green" : "tp-btn-border"
                            }`}
                    >
                        <div className="tp-btn-text text-center">Choose your plan</div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PricingCard;