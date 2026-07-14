import { DropdownArrowIcon } from '@/svg';
import Image from 'next/image';

const faqData = [
    {
        id: 1,
        question: 'What services does your agency offer?',
        answer:
            'From branding to web development, our team delivers a seamless experience with exceptional attention to detail and responsiveness.',
        isActive: true,
    },
    {
        id: 2,
        question: 'Do you provide custom website solutions?',
        answer:
            'Yes, we specialize in creating fully customized websites tailored to your business goals and brand identity.',
    },
    {
        id: 3,
        question: 'Can you redesign my existing website?',
        answer:
            'Absolutely. We can modernize your existing website with a fresh design, improved performance, and better user experience.',
    },
    {
        id: 4,
        question: 'Do you offer digital marketing solutions?',
        answer:
            'Yes, we offer SEO, content strategy, and paid campaigns to enhance your online presence and reach your target audience.',
    },
    {
        id: 5,
        question: 'Is there a consultation fee?',
        answer:
            'No, our initial consultation is free of charge to discuss your project needs and provide strategic recommendations.',
    },
];

const ModernAgencyFaq = () => {
    return (
        <div className="ma-faq-ptb p-relative pt-120 pb-120">
            <div className="container container-1510">
                <div className="row">
                    {/* Left Side: Images */}
                    <div className="col-xl-6">
                        <div className="tp-faq-title-box p-relative mb-40">
                            <span className="tp-section-subtitle tp-split-title">{`// Our Faq`}</span>
                            <h3 className="tp-section-title fs-62 tl-unbounded tp-split-title">
                                Questions <br /> And Answers
                            </h3>
                        </div>

                        <div className="ma-faq-thumb">
                            <Image
                                className="tp_fade_anim img-fluid"
                                data-delay=".5"
                                data-fade-from="top"
                                data-ease="bounce"
                                src="/assets/img/modern-agency/faq/faq-1.jpg"
                                width={381}
                                height={380}
                                alt="faq image"
                            />
                            <Image
                                className="ma-faq-thumb-2 tp_fade_anim"
                                data-delay=".7"
                                data-fade-from="top"
                                data-ease="bounce"
                                src="/assets/img/modern-agency/faq/faq-2.png"
                                width={264}
                                height={348}
                                alt="faq image"
                            />
                        </div>
                    </div>

                    {/* Right Side: FAQ Accordion */}
                    <div className="col-xl-6">
                        <div className="tp-faq-accordion-wrap">
                            <div className="accordions" id="accordionExample">
                                {faqData.map(({ id, question, answer, isActive }) => (
                                    <div
                                        key={id}
                                        className={`accordion-items mb-20 tp_fade_anim ${isActive ? 'active' : ''}`}
                                        data-delay=".3"
                                    >
                                        <div className="accordion-header">
                                            <button
                                                className={`accordion-buttons ${!isActive ? 'collapsed' : ''}`}
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target={`#collapse${id}`}
                                                aria-expanded={isActive ? 'true' : 'false'}
                                                aria-controls={`collapse${id}`}
                                            >
                                                {question}
                                                <span className="tp-accordion-icon">
                                                    <DropdownArrowIcon />
                                                </span>
                                            </button>
                                        </div>
                                        <div
                                            id={`collapse${id}`}
                                            className={`accordion-collapse collapse ${isActive ? 'show' : ''}`}
                                            data-bs-parent="#accordionExample"
                                        >
                                            <div className="accordion-body">
                                                <p>{answer}</p>
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

export default ModernAgencyFaq;
