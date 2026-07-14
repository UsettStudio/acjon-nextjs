import { CheckIconThree } from '@/svg/CheckIcons';
import Link from 'next/link';

const pricingPlans = [
    {
        title: 'Basic',
        description: 'Ideal for small businesses or startups',
        price: '$450',
        duration: '/Free',
        delay: '.3',
        active: false,
    },
    {
        title: 'Standard',
        description: 'Ideal for small businesses or startups',
        price: '$550',
        duration: '/Month',
        delay: '.4',
        active: true,
    },
    {
        title: 'Advanced',
        description: 'Ideal for small businesses or startups',
        price: '$650',
        duration: '/Month',
        delay: '.5',
        active: false,
    },
];

const includedFeatures = [
    'Basic Branding Package',
    'Custom 5-Page Website',
    'SEO Optimization Basics',
    'Full Brand Strategy & Design',
    'On-Demand Design Revisions',
];

interface pricingProps {
    sectionPaddingClass?: string;
    titleClass?: string
}

const ModernAgencyPricing = ({ sectionPaddingClass = "pb-130", titleClass = "tp-split-title" }: pricingProps) => {
    return (
        <section className={`ma-price-ptb ${sectionPaddingClass}`}>
            <div className="container container-1510">
                {/* Section Header */}
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="bnc-pricing-title-box text-center pb-55">
                            <span className="tp-section-subtitle fs-16 tp-split-title">
                                {`// Our suitable pricing plans //`}
                            </span>
                            <h3 className={`tp-section-title fs-62 tl-unbounded mb-15 ${titleClass}`}>
                                Special Offer! choose <br /> your pack today
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="row">
                    {pricingPlans.map((plan, index) => (
                        <div key={index} className="col-xl-4 col-md-6">
                            <div
                                className={`ma-price-item mb-30 tp_fade_anim ${plan.active ? 'active' : ''}`}
                                data-delay={plan.delay}
                            >
                                {/* Header */}
                                <div className="ma-price-head">
                                    <span>{plan.title}</span>
                                    <p>{plan.description}</p>
                                    <h4>
                                        {plan.price}
                                        <i>{plan.duration}</i>
                                    </h4>
                                </div>

                                {/* Feature List */}
                                <div className="ma-price-list">
                                    <h4 className="ma-price-list-title">Includes:</h4>
                                    <ul>
                                        {includedFeatures.map((feature, i) => (
                                            <li key={i}>
                                                <span>
                                                    <CheckIconThree />
                                                </span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Button */}
                                <div className="ma-price-item-btn">
                                    <Link
                                        className="tp-btn-border btn-h-60 text-center tp-btn-anim w-100"
                                        href="/contact-us"
                                    >
                                        <div className="tp-btn-text text-center">Choose your plan</div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ModernAgencyPricing;
