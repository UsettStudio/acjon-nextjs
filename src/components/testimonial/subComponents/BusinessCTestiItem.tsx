import { testimonialItemDt } from '@/types/custom-dt';
import { QuoteIconThree } from '@/svg/QuoteIcons';
import { StarIconNine } from '@/svg';
import React from 'react';

const BusinessCTestiItem:React.FC<testimonialItemDt> = ({ content, name, role }) => {
    return (
        <div className="bnc-testimonial-item">
            <div className="bnc-testimonial-item-icon">
                <span>
                    <QuoteIconThree />
                </span>
            </div>

            <div className="bnc-testimonial-item-text">
                <p>{content}</p>
            </div>

            <div className="bnc-testimonial-item-bottom d-flex justify-content-between align-items-center">
                <div className="bnc-testimonial-item-user">
                    <span>{name}</span>
                    <p>{role}</p>
                </div>
                <div className="bnc-testimonial-item-stars">
                    <span>
                        <StarIconNine />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BusinessCTestiItem;