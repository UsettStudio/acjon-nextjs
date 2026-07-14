import { testimonialItemDt } from '@/types/custom-dt';
import { QuoteIconThree } from '@/svg/QuoteIcons';
import Image from 'next/image';
import React from 'react';

const HRConsutltingTestiItem:React.FC<testimonialItemDt> = ({ content, image, name, position }) => {
    return (
        <div className="hr-testimonial-item">
            <span className="hr-testimonial-icon">
                <QuoteIconThree />
            </span>
            <p>{content}</p>
            <div className="hr-testimonial-author d-flex align-items-center">
                <div className="hr-testimonial-avater">
                    {image && <Image width={70} height={70} src={image} alt={`${name} avatar`}/>}
                </div>
                <div className="hr-testimonial-avater-info">
                    <h4>{name}</h4>
                    <span>{position}</span>
                </div>
            </div>
        </div>
    );
};

export default HRConsutltingTestiItem;