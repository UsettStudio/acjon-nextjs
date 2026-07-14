import { testimonialItemDt } from '@/types/custom-dt';
import { QuoteIcon } from '@/svg/QuoteIcons';
import Image from 'next/image';
import React from 'react';

const ModernATestiItem:React.FC<testimonialItemDt> = ({ image, content, name, role }) => {
    return (
        <div className="ma-testimonial-item">
            <div className="row align-items-center">
                {/* Image Section */}
                <div className="col-lg-4">
                    <div className="ma-testimonial-thumb">
                        {image && <Image width={360} height={360} className='img-fluid w-100 h-auto' src={image} alt={`${name} photo`} />}
                        <span className="ma-testimonial-quote">
                            <QuoteIcon width="28" height="26" />
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="col-lg-8">
                    <div className="ma-testimonial-wrap">
                        <div className="ma-testimonial-content">
                            <p>{content}</p>
                        </div>
                        <div className="ma-testimonial-dsc">
                            <h4 className="ma-testimonial-dsc-title">{name}</h4>
                            <span>{role}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernATestiItem;