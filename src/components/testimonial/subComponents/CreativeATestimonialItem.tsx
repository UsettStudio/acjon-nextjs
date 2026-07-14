import { testimonialItemDt } from '@/types/custom-dt';
import Image from 'next/image';
import React from 'react';

const CreativeATestimonialItem: React.FC<testimonialItemDt> = ({ content, image, name, position }) => {
    return (
        <div className="ca-testimonial-item">
            <div className="ca-testimonial-item-icon mb-30">
                <span>
                    <Image width={32} height={18} src="/assets/img/creative-agency/testimonial/quate.svg" alt="quote" />
                </span>
            </div>
            <div className="ca-testimonial-item-content">
                <p>{content}</p>
            </div>
            <div className="ca-testimonial-item-user d-flex">
                <div className="ca-testimonial-item-user-thumb">
                    {image && <Image className='img-fluid w-auto h-auto' width={50} height={50} src={image} alt={name} />}
                </div>
                <div className="ca-testimonial-item-user-content">
                    <h4>{name}</h4>
                    <p>{position}</p>
                </div>
            </div>
        </div>
    );
};

export default CreativeATestimonialItem;