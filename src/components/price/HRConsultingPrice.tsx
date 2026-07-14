import { CheckIconThree } from "@/svg/CheckIcons";
import Link from "next/link";
import {
    ArrowIconThirteen,
    DiamondIcon,
    ShapeTitleLineTwo,
    StarIconEleven,
} from "@/svg";

const pricePlans = [
    {
        id: 1,
        name: "Basic plan",
        price: "$55",
        icon: <StarIconEleven />,
        active: false,
        delay: ".5",
        features: [
            "Basic Branding Package",
            "Custom 5-Page Website",
            "SEO Optimization Basics",
            "Full Brand Strategy & Design",
        ],
    },
    {
        id: 2,
        name: "Premium plan",
        price: "$85",
        icon: <DiamondIcon />,
        active: true,
        delay: ".7",
        features: [
            "Basic Branding Package",
            "Custom 5-Page Website",
            "SEO Optimization Basics",
            "Full Brand Strategy & Design",
        ],
    },
];

const HRConsultingPrice = () => {
    return (
        <div
            className="hr-price-ptb z-index-1 pt-120 pb-90 pl-160 pr-160"
            style={{ backgroundColor: "#fff" }}
        >
            {/* Title Section */}
            <div className="row justify-content-center">
                <div className="col-xl-8">
                    <div className="hr-price-title-box text-center mb-60">
                        <span
                            className="tp-section-subtitle st-dot st-border tp_fade_anim"
                            data-delay=".3"
                        >
                            Our Pricing Plan
                        </span>
                        <h4 className="tp-section-title tl-spacegro text-case-int tp-split-title">
                            Affordable Solutions <br /> Premium{" "}
                            <span className="p-relative">
                                Results.
                                <ShapeTitleLineTwo />
                            </span>
                        </h4>
                    </div>
                </div>
            </div>

            {/* Pricing Plans */}
            <div className="hr-price-style">
                <div className="row">
                    {pricePlans.map((plan) => (
                        <div className="col-lg-6" key={plan.id}>
                            <div
                                className={`ma-price-item mb-30 tp_fade_anim ${plan.active ? "active" : ""
                                    }`}
                                data-delay={plan.delay}
                            >
                                {/* Header */}
                                <div className="ma-price-head d-flex align-items-center justify-content-between">
                                    <div>
                                        <span>{plan.name}</span>
                                        <h4>
                                            {plan.price} <i>/Per Month</i>
                                        </h4>
                                    </div>
                                    <div className="ma-price-icon pl-20">
                                        <span>{plan.icon}</span>
                                    </div>
                                </div>

                                {/* Feature List */}
                                <div className="ma-price-list-wrap">
                                    <h4 className="ma-price-list-title">Includes:</h4>
                                    <div className="row row-cols-xl-2 row-cols-lg-1 row-cols-md-2 row-cols-1">
                                        {plan.features.map((feature, index) => (
                                            <div className="col" key={index}>
                                                <div className="ma-price-list">
                                                    <ul>
                                                        <li>
                                                            <span>
                                                                <CheckIconThree />
                                                            </span>
                                                            {feature}
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Button */}
                                <div className="ma-price-item-btn">
                                    <Link
                                        className="tp-btn-border btn-h-60 tp-btn-anim radius-btn"
                                        href="/contact-us"
                                    >
                                        <div className="tp-btn-text">Choose your plan</div>
                                        <span>
                                            <ArrowIconThirteen direction="right"/>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HRConsultingPrice;
