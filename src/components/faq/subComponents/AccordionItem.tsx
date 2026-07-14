import { DropdownArrowIconTwo } from "@/svg/ArrowIcon";

interface AccordionItemProps {
  id: string;
  question: string;
  answer: string;
  show?: boolean;
}

const AccordionItem = ({
  id,
  question,
  answer,
  show = false,
}: AccordionItemProps) => {
  return (
    <div className={`accordion-items mb-20 ${show ? "active" : ""}`}>
      <div className="accordion-header">
        <button
          className={`accordion-buttons ${!show ? "collapsed" : ""}`}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#collapse-${id}`}
          aria-expanded={show}
          aria-controls={`collapse-${id}`}
        >
          {question}
          <span className="tp-accordion-icon">
            <DropdownArrowIconTwo />
          </span>
        </button>
      </div>

      <div
        id={`collapse-${id}`}
        className={`accordion-collapse collapse ${show ? "show" : ""}`}
        data-bs-parent="#faqAccordion"
      >
        <div className="accordion-body">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
