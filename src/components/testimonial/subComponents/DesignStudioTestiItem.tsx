import { testimonialItemDt } from '@/types/custom-dt';
import { StarIconTen } from '@/svg/StarIcons';
import Image from 'next/image';
import React from 'react';

const DesignStudioTestiItem: React.FC<testimonialItemDt> = ({ content, name, position }) => {
    return (
        <div className="ds-testimonial-item">
            <span className="ds-testimonial-item-name">
                <StarIconTen /> Kundeomtale
            </span>

            {/* Star Ratings */}
            <div className="ds-testimonial-item-starts d-flex pb-30">
                {[...Array(5)].map((_, i) => (
                    <span key={i}>
                        <Image width={24} height={24} src="/assets/img/design-studio/testimonial/start.svg" alt="star icon" />
                    </span>
                ))}
            </div>

            {/* Review Content */}
            <div className="ds-testimonial-item-content">
                <p>{content}</p>
            </div>

            {/* Client Info */}
            <div className="ds-testimonial-item-des">
                <span className="ds-testimonial-item-title">
                    {name}
                </span>
                <p>{position}</p>
            </div>
        </div>
    );
};

export default DesignStudioTestiItem;