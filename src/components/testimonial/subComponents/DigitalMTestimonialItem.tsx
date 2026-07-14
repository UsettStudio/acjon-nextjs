import { StarIconThree } from '@/svg';
import { testimonialItemDt } from '@/types/custom-dt';
import React from 'react';

const DigitalMTestimonialItem: React.FC<testimonialItemDt> = (
    { rating, ratingText, content, name, role, number }) => {
        
    return (
        <div className="tp-testimonial-slider-item p-relative">
            {/* Rating */}
            <div className="tp-testimonial-slider-action d-flex justify-content-between align-items-center">
                <div className="tp-testimonial-slider-ratting d-flex align-items-center mb-15">
                    <h4 className="tp-testimonial-slider-ratting-num">
                        {rating}
                    </h4>
                    <div className="tp-testimonial-slider-ratting-info">
                        <span>
                            {Array.from({ length: 5 }, (_, i) => (
                                <i key={i} style={{ marginRight: "4px" }}>
                                    <StarIconThree />
                                </i>
                            ))}
                        </span>
                        <p>{ratingText}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="tp-testimonial-slider-content">
                <p>{content}</p>
            </div>

            {/* Author */}
            <div className="tp-testimonial-slider-dsc">
                <h4 className="tp-testimonial-slider-dsc-title">
                    {name}
                </h4>
                <span>{role}</span>
            </div>

            {/* Number */}
            <span className="tp-testimonial-number">{number}</span>
        </div>
    );
};

export default DigitalMTestimonialItem;