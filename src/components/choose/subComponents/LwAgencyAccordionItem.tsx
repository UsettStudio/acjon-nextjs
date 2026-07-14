import React from 'react';

interface faqProps {
    id: string;
    title: string;
    content: string;
    isActive: boolean;
}

const LwAgencyAccordionItem: React.FC<faqProps> = ({ id, title, content, isActive }) => {
    return (
        <div className={`accordion-items mb-20 ${isActive ? "active" : ""}`}>
            <div className="accordion-header">
                <button
                    className={`accordion-buttons ${isActive ? "" : "collapsed"}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#${id}`}
                    aria-expanded={isActive}
                    aria-controls={id}
                >
                    {title}
                    <span className="tp-accordion-icon">
                        <svg
                            width="16"
                            height="10"
                            viewBox="0 0 16 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M1 1.06445L8 8.06445L15 1.06445"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                        </svg>
                    </span>
                </button>
            </div>
            <div
                id={id}
                className={`accordion-collapse collapse ${isActive ? "show" : ""}`}
                data-bs-parent="#accordionExample"
            >
                <div className="accordion-body">
                    <p>{content}</p>
                </div>
            </div>
        </div>
    );
};

export default LwAgencyAccordionItem;