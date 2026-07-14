import { ArrowIconEleven } from '@/svg/ArrowIcon';
import Image from 'next/image';

// Step Data
const stepData = [
    {
        id: 1,
        title: 'Strategic Planning',
        description:
            'Business consulting services are designed to unlock the full potential of your company.',
    },
    {
        id: 2,
        title: 'Concept & Design',
        description:
            'Business consulting services are designed to unlock the full potential of your company.',
    },
    {
        id: 3,
        title: 'Client Collaboration',
        description:
            'Business consulting services are designed to unlock the full potential of your company.',
    },
    {
        id: 4,
        title: 'Scaling & Expansion',
        description:
            'Business consulting services are designed to unlock the full potential of your company.',
    },
];

const BusinessConsultingStep = () => {
    return (
        <div
            className="bnc-step-area p-relative pt-100 pb-50 fix"
            style={{ backgroundColor: '#ECF8F8' }}
        >
            {/* Section Label */}
            <div
                className="bnc-step-text-wrap tp_fade_anim"
                data-delay=".5"
                data-fade-from="top"
                data-ease="bounce"
            >
                <h4 className="bnc-step-text-title">Experts</h4>
            </div>

            <div className="container container-1510">
                <div className="row">
                    {/* Left Column */}
                    <div className="col-lg-6">
                        <div className="bnc-step-title-box pb-60">
                            <span className="tp-section-subtitle fs-16 st-dot tp-split-title">
                                How We Work
                            </span>
                            <h3 className="tp-section-title fs-72 tp-split-title">
                                A Smarter Way to <br /> Achieve Your Goals.
                            </h3>
                        </div>

                        <div className="bnc-step-thumb z-index-1 fix tp-clip-anim">
                            <Image
                                className="w-100 tp-anim-img"
                                data-animate="true"
                                data-speed=".8"
                                width={728}
                                height={491}
                                src="/assets/img/business-consulting/step/step-thumb-1.jpg"
                                alt="Business consulting step"
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-lg-6">
                        <div className="bnc-step-wrapper">
                            {stepData.map((step) => (
                                <div key={step.id} className="bnc-step-item p-relative mb-70">
                                    <div className="bnc-step-item-sub">
                                        <span>
                                            <ArrowIconEleven />
                                        </span>{" "}
                                        step _ {String(step.id).padStart(2, '0')}
                                    </div>
                                    <h4 className="bnc-step-item-title">{step.title}</h4>
                                    <div className="bnc-step-item-text">
                                        <p>{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessConsultingStep;
