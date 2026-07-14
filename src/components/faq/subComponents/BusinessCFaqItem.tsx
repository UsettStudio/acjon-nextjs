import { DropdownArrowIcon } from '@/svg';
import { faqDt } from '@/types/custom-dt';
import React from 'react';

const BusinessCFaqItem: React.FC<faqDt> = ({ id, show, question, answer }) => {
    return (
        <div className={`accordion-items mb-20 tp_fade_anim ${show ? "active" : ""}`}>
            <div className="accordion-header">
                <button className={`accordion-buttons ${show ? "" : "collapsed"}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#${id}`}
                    aria-expanded={show ? "true" : "false"}
                    aria-controls={id}
                >
                    {question}
                    <span className="tp-accordion-icon">
                        <DropdownArrowIcon />
                    </span>
                </button>
            </div>
            <div
                id={id}
                className={`accordion-collapse collapse ${show ? "show" : ""
                    }`}
                data-bs-parent="#accordionExample"
            >
                <div className="accordion-body">
                    <p>{answer}</p>
                </div>
            </div>
        </div>
    );
};

export default BusinessCFaqItem;