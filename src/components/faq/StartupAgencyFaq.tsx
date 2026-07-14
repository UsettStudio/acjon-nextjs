import { DropdownArrowIconTwo } from '@/svg/ArrowIcon';
import { WorkLineIcon } from '@/svg/ShapeIcons';

const faqData = [
    {
        id: 'One',
        question: 'What services does your agency offer?',
        answer: `Our team blends creativity with a deep understanding of start-up dynamics. 
             We prioritize innovation, data driven decisions, and user-focused designs 
             while offering a collaborative,`,
        isOpen: true,
    },
    {
        id: 'Two',
        question: 'Do you provide custom website solutions?',
        answer: `Our team blends creativity with a deep understanding of start-up dynamics. 
             We prioritize innovation, data driven decisions, and user-focused designs 
             while offering a collaborative,`,
        isOpen: false,
    },
    {
        id: 'Three',
        question: 'Can you redesign my existing website?',
        answer: `Our team blends creativity with a deep understanding of start-up dynamics. 
             We prioritize innovation, data driven decisions, and user-focused designs 
             while offering a collaborative,`,
        isOpen: false,
    },
    {
        id: 'Four',
        question: 'Do you offer digital marketing solutions?',
        answer: `Our team blends creativity with a deep understanding of start-up dynamics. 
             We prioritize innovation, data driven decisions, and user-focused designs 
             while offering a collaborative,`,
        isOpen: false,
    },
    {
        id: 'Five',
        question: 'Is there a consultation fee?',
        answer: `Our team blends creativity with a deep understanding of start-up dynamics. 
             We prioritize innovation, data driven decisions, and user-focused designs 
             while offering a collaborative,`,
        isOpen: false,
    },
];

const StartupAgencyFaq = () => {
    return (
        <div className="sa-faq-area pt-110 pb-120" style={{ backgroundColor: '#0A0A0A' }}>
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="sa-faq-title-box text-center">
                            <span className="sa-faq-subtitle">
                                Frequently Asked Questions <WorkLineIcon />
                            </span>
                            <h4 className="sa-faq-title tp-text-perspective">Faq</h4>
                        </div>
                    </div>
                </div>

                {/* Accordion */}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="sa-faq-wrapper">
                            <div className="tp-faq-accordion-wrap">
                                <div className="accordions" id="accordionExample">
                                    {faqData.map(({ id, question, answer, isOpen }) => (
                                        <div
                                            key={id}
                                            className={`accordion-items mb-20 tp_fade_anim ${isOpen ? 'active' : ''}`}
                                            data-delay=".3"
                                        >
                                            <div className="accordion-header">
                                                <button
                                                    className={`accordion-buttons ${!isOpen ? 'collapsed' : ''}`}
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#collapse${id}`}
                                                    aria-expanded={isOpen}
                                                    aria-controls={`collapse${id}`}
                                                >
                                                    {question}
                                                    <span className="tp-accordion-icon">
                                                        <DropdownArrowIconTwo />
                                                    </span>
                                                </button>
                                            </div>
                                            <div
                                                id={`collapse${id}`}
                                                className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
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
        </div>
    );
};

export default StartupAgencyFaq;
