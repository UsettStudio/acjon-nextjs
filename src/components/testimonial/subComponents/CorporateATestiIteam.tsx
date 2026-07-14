import { testimonialItemDt } from '@/types/custom-dt';
import { QuoteIcon } from '@/svg/QuoteIcons';
import React from 'react';

const CorporateATestiIteam: React.FC<testimonialItemDt> = ({ content, name, role }) => {
    return (
        <div className="ds-testimonial-item text-center">
            <span className="cr-testimonial-quote">
                <QuoteIcon />
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

export default CorporateATestiIteam;