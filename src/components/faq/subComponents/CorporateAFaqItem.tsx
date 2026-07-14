import { DropdownArrowIconTwo } from "@/svg/ArrowIcon";
import { faqDt } from "@/types/custom-dt";

const CorporateAFaqItem: React.FC<faqDt> = ({ id, question, answer, show }) => (
    <div className={`accordion-items mb-20 tp_fade_anim ${show ? 'active' : ''}`}>
        <div className="accordion-header">
            <button
                className={`accordion-buttons ${show ? '' : 'collapsed'}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#${id}`}
                aria-expanded={show ? 'true' : 'false'}
                aria-controls={id}
            >
                {question}
                <span className="tp-accordion-icon">
                    <DropdownArrowIconTwo />
                </span>
            </button>
        </div>
        <div
            id={id}
            className={`accordion-collapse collapse ${show ? 'show' : ''}`}
            data-bs-parent="#accordionExample"
        >
            <div className="accordion-body">
                <p>{answer}</p>
            </div>
        </div>
    </div>
);
export default CorporateAFaqItem;