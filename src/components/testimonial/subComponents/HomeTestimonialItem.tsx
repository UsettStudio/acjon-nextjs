import { testimonialItemDt } from '@/types/custom-dt';
import React from 'react';

interface testimonialProps {
    item: testimonialItemDt
}

const HomeTestimonialItem: React.FC<testimonialProps> = ({ item }) => {
    return (
        <div className="tp-testimonial-slider-item">
            <div className="tp-testimonial-slider-content">
                <p>{item.content}</p>
            </div>
            <div className="tp-testimonial-slider-dsc">
                <h4 className="tp-testimonial-slider-dsc-title">
                    {item.name}
                </h4>
                <span>{item.role}</span>
            </div>
        </div>
    );
};

export default HomeTestimonialItem;