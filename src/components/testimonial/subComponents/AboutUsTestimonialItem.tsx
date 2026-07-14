import { testimonialItemDt } from "@/types/custom-dt";
import { QuoteIconFour } from "@/svg/QuoteIcons";

const AboutUsTestimonialItem:React.FC<testimonialItemDt> = ({ name, role, content }) => {
    return (
        <div className="ds-testimonial-item text-center">
            <span className="cr-testimonial-quote">
                <QuoteIconFour />
            </span>

            <div className="ds-testimonial-item-content">
                <p>{content}</p>
            </div>

            <div className="ds-testimonial-item-des">
                <span className="ds-testimonial-item-title">{name}</span>
                <p>{role}</p>
            </div>
        </div>
    );
};

export default AboutUsTestimonialItem;