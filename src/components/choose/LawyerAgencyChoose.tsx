import LwAgencyAccordionItem from "./subComponents/LwAgencyAccordionItem";
import LwAgencyFunfactItem from "./subComponents/LwAgencyFunfactItem";

const accordionData = [
    {
        id: "collapseOne",
        title: "What services do you offer?",
        content:
            "From branding to web development, our team delivers a seamless experience with attention to detail.",
        isActive: true,
    },
    {
        id: "collapseTwo",
        title: "What industries do you specialize in?",
        content:
            "We specialize in diverse industries, ensuring each project receives expert insight and tailored solutions.",
        isActive: false,
    },
    {
        id: "collapseThree",
        title: "Do you offer post-project support?",
        content:
            "Yes, we provide ongoing support and maintenance to ensure long-term success after project completion.",
        isActive: false,
    },
];

const funFactData = [
    { id: 1, value: 24, suffix: "+", label: "Agency Experience" },
    { id: 2, value: 60, suffix: "+", label: "Team Members" },
    { id: 3, value: 155, suffix: "+", label: "Successfully Project" },
    { id: 4, value: 98, suffix: "%", label: "Clients Satisfied" },
];


const LawyerAgencyChoose = () => {
    return (
        <div className="lw-choose-area pt-120 pb-120">
            <div className="container container-1510">
                <div className="row align-items-end">
                    {/* Left Section (Accordion) */}
                    <div className="col-xl-6">
                        <div className="lw-funfact-left-wrap">
                            <div className="lw-choose-title-box mb-55">
                                <span className="lw-section-subtitle mb-15">
                                    <i className="fa-light fa-gavel"></i>Why Choose Us
                                </span>
                                <h4 className="tp-section-title title-playfair tp-split-title">
                                    Driven by passion, defined <br /> by <span>Expertise.</span>
                                </h4>
                            </div>

                            <div className="tp-faq-accordion-wrap lw-faq-style">
                                <div className="accordions" id="accordionExample">
                                    {accordionData.map((item) => (
                                        <LwAgencyAccordionItem key={item.id} {...item} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section (Fun Facts) */}
                    <div className="col-xl-6">
                        <div className="lw-funfact-wrap">
                            <div className="row gx-0">
                                {funFactData.map((item, index) => (
                                    <LwAgencyFunfactItem key={index} {...item} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerAgencyChoose;
