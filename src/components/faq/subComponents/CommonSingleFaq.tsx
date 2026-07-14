import { FaqItem } from '@/data/faqData';
import { DropdownArrowIcon } from '@/svg';

interface faqProps {
    item: FaqItem;
}

const CommonSingleFaq: React.FC<faqProps> = ({ item }) => {
    return (
        <div
            className={`accordion-items mb-20 tp_fade_anim ${item.show ? 'active' : ''}`}
            data-delay=".3"
        >
            <div className="accordion-header">
                <button
                    className={`accordion-buttons ${item.show ? '' : 'collapsed'}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#${item.id}`}
                    aria-expanded={item.show}
                    aria-controls={item.id}
                >
                    {item.question}
                    <span className="tp-accordion-icon">
                        <DropdownArrowIcon />
                    </span>
                </button>
            </div>
            <div
                id={item.id}
                className={`accordion-collapse collapse ${item.show ? 'show' : ''}`}
                data-bs-parent="#accordionExample"
            >
                <div className="accordion-body">
                    <p>{item.answer}</p>
                </div>
            </div>
        </div>
    );
};

export default CommonSingleFaq;