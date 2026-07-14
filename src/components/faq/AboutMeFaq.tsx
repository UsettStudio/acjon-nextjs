import { DropdownArrowIconTwo } from "@/svg/ArrowIcon";

const faqData = [
    {
        id: "one",
        question: "What services does your agency offer?",
        answer:
            "From branding to web development, their team delivered a seamless experience. The attention to detail, responsiveness.",
        isOpen: true,
    },
    {
        id: "two",
        question: "Do you provide custom website solutions?",
        answer:
            "From branding to web development, their team delivered a seamless experience. The attention to detail, responsiveness.",
    },
    {
        id: "three",
        question: "Can you redesign my existing website?",
        answer:
            "From branding to web development, their team delivered a seamless experience. The attention to detail, responsiveness.",
    },
    {
        id: "four",
        question: "Do you offer digital marketing solutions?",
        answer:
            "From branding to web development, their team delivered a seamless experience. The attention to detail, responsiveness.",
    },
    {
        id: "five",
        question: "Is there a consultation fee?",
        answer:
            "From branding to web development, their team delivered a seamless experience. The attention to detail, responsiveness.",
    },
];



const AboutMeFaq = () => {
    return (
        <div className="tp-about-me-faq-ptb pt-160 pb-150">
            <div className="container">
                <div className="row">
                    {/* Left Content */}
                    <div className="col-lg-5">
                        <div className="tp-about-me-faq-heading mb-40">
                            <span
                                className="tp-about-me-service-title mb-20 tp_fade_anim"
                                data-delay=".3"
                            >
                                Frequently Asked Questions
                            </span>
                            <h4 className="tp-about-me-faq-title tp-text-revel">
                                Frequently <br /> Asked Questions
                            </h4>
                        </div>
                    </div>

                    {/* Right Accordion */}
                    <div className="col-lg-7">
                        <div className="tp-about-me-faq-wrap tp_fade_anim" data-delay=".5">
                            <div className="tp-faq-accordion-wrap">
                                <div className="accordions" id="accordionExample">
                                    {faqData.map((item) => {
                                        const collapseId = `collapse-${item.id}`;
                                        return (
                                            <div
                                                key={item.id}
                                                className={`accordion-items mb-20 ${item.isOpen ? "active" : ""
                                                    }`}
                                            >
                                                <div className="accordion-header">
                                                    <button
                                                        className={`accordion-buttons ${item.isOpen ? "" : "collapsed"
                                                            }`}
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target={`#${collapseId}`}
                                                        aria-expanded={item.isOpen ?? false}
                                                        aria-controls={collapseId}
                                                    >
                                                        {item.question}
                                                        <span className="tp-accordion-icon">
                                                            <DropdownArrowIconTwo />
                                                        </span>
                                                    </button>
                                                </div>

                                                <div
                                                    id={collapseId}
                                                    className={`accordion-collapse collapse ${item.isOpen ? "show" : ""
                                                        }`}
                                                    data-bs-parent="#accordionExample"
                                                >
                                                    <div className="accordion-body">
                                                        <p>{item.answer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutMeFaq;
