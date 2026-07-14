import { CheckIconThree } from '@/svg/CheckIcons';
import { ArrowIconFive } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

// Pricing Plans Data
const pricingPlans = [
    {
        id: 1,
        title: 'Standard',
        description: 'Ideal for small businesses or startups.',
        features: [
            'Basic Branding Package',
            'Custom 5-Page Website',
            'SEO Optimization Basics',
            'Full Brand Strategy & Design',
            'On-Demand Design Revisions',
        ],
        price: '$55',
        period: '/monthly',
        delay: '.5',
        active: false,
    },
    {
        id: 2,
        title: 'Advanced',
        description: 'Built for growing businesses.',
        features: [
            'Basic Branding Package',
            'Custom 5-Page Website',
            'SEO Optimization Basics',
            'Full Brand Strategy & Design',
            'On-Demand Design Revisions',
        ],
        price: '$79',
        period: '/yearly',
        delay: '.7',
        active: true,
    },
];

// Benefits Data
const benefits = [
    'Get 30 day free trial',
    'No hidden fees',
    'Cancel anytime',
    'Monthly management',
];

const BusinessConsultingPricing = () => {
    return (
        <div className="bnc-pricing-ptb pb-130">
            <div className="container container-1510">
                <div className="row">
                    {/* Left Section */}
                    <div className="col-lg-5">
                        <div className="bnc-pricing-left">
                            {/* Section Header */}
                            <div className="bnc-pricing-title-box pb-25">
                                <span className="tp-section-subtitle fs-16 st-dot tp-split-title">
                                    Our Pricing
                                </span>
                                <h3 className="tp-section-title fs-72 mb-15 tp-split-title">
                                    Pricing That <br /> Fits Your Goals.
                                </h3>
                                <p>
                                    We offer flexible and transparent pricing plans designed to
                                    match your needs and budget.
                                </p>
                            </div>

                            {/* Benefits List */}
                            <div className="bnc-pricing-list">
                                <ul>
                                    {benefits.map((benefit, index) => (
                                        <li key={index}>
                                            <span>
                                                <CheckIconThree />
                                            </span>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Payment Methods */}
                            <div className="bnc-pricing-methods">
                                <span>Trusted by secure payment services</span>
                                <Image width={376} height={24} src="/assets/img/business-consulting/pricing/payment-methods.png" alt="Payment methods" />
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="col-lg-7">
                        <div className="bnc-pricing-wrapper">
                            <div className="row">
                                {pricingPlans.map((plan) => (
                                    <div key={plan.id} className="col-xl-6">
                                        <div
                                            className={`ds-price-item mb-30 tp_fade_anim ${plan.active ? 'active' : ''
                                                }`}
                                            data-delay={plan.delay}
                                        >
                                            {/* Header */}
                                            <div className="ds-price-item-head bb">
                                                <span>{plan.title}</span>
                                                <p>{plan.description}</p>
                                            </div>

                                            {/* Features */}
                                            <div className="ds-price-item-list">
                                                <h4 className="ds-price-item-list-title">Includes:</h4>
                                                <ul>
                                                    {plan.features.map((feature, idx) => (
                                                        <li key={idx}>
                                                            <span>
                                                                <CheckIconThree />
                                                            </span>{" "}
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Button */}
                                            <div className="ds-price-item-btn">
                                                <Link
                                                    className="tp-btn-green btn-h-60 tp-btn-anim"
                                                    href="/contact-us"
                                                >
                                                    <div className="tp-btn-text">Choose your plan</div>
                                                    <span>
                                                        <ArrowIconFive />
                                                    </span>
                                                </Link>
                                            </div>

                                            {/* Price */}
                                            <div className="ds-price-item-head">
                                                <h4>
                                                    {plan.price} <i>{plan.period}</i>
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessConsultingPricing;
