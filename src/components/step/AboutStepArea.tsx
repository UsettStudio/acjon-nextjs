import { ArrowIconEleven } from "@/svg/ArrowIcon";
import Image from "next/image";

const steps = [
    {
        title: "Strategic Planning",
        description: "Business consulting services are designed to unlock the full potential of your company.",
        step: "01",
    },
    {
        title: "Concept & Design",
        description: "Business consulting services are designed to unlock the full potential of your company.",
        step: "02",
    },
    {
        title: "Client Collaboration",
        description: "Business consulting services are designed to unlock the full potential of your company.",
        step: "03",
    },
    {
        title: "Scaling & Expansion",
        description: "Business consulting services are designed to unlock the full potential of your company.",
        step: "04",
    },
];

const StepItem: React.FC<{ title: string; description: string; step: string }> = ({ title, description, step }) => (
    <div className="bnc-step-item p-relative mb-70">
        <div className="bnc-step-item-sub">
            <span><ArrowIconEleven /></span>
            step _ {step}
        </div>
        <h4 className="bnc-step-item-title">{title}</h4>
        <div className="bnc-step-item-text">
            <p>{description}</p>
        </div>
    </div>
);

const AboutStepArea = () => {
    return (
        <div className="bnc-step-area p-relative pt-100 pb-50">
            <div className="bnc-step-text-wrap tp-about-inner-step-text">
                <h4 className="bnc-step-text-title tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                    Experts
                </h4>
            </div>

            <div className="container container-1510">
                <div className="row">
                    {/* Left Column - Image */}
                    <div className="col-lg-6">
                        <div className="bnc-step-title-box pb-60">
                            <span className="tp-section-subtitle st-unbounded st-dot st-border tp_fade_anim" data-delay=".3">
                                How We Work
                            </span>
                            <h3 className="tp-section-title tt-capitalize fs-42 tl-unbounded fw-600 tp-split-title">
                                A Smarter Way to <br />
                                Achieve Your Goals.
                            </h3>
                        </div>
                        <div className="bnc-step-thumb fix tp-clip-anim z-index-1">
                            <Image
                                width={731}
                                height={493}
                                className="w-100 tp-anim-img"
                                data-animate="true"
                                src="/assets/img/business-consulting/step/step-thumb-1.jpg"
                                alt="step thumb"
                            />
                        </div>
                    </div>

                    {/* Right Column - Steps */}
                    <div className="col-lg-6">
                        <div className="bnc-step-wrapper">
                            {steps.map((item, idx) => (
                                <StepItem key={idx} {...item} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutStepArea;
