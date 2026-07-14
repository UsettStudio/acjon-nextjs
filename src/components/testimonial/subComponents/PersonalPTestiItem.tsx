import { CDotIcon, QuoteIconTwo, StarIconSeven, TextLogoIconTwo } from '@/svg';
import { testimonialItemDt } from '@/types/custom-dt';
import React from 'react';

const PersonalPTestiItem:React.FC<testimonialItemDt> = ({ rating, reviews, platform, content, role, name }) => {

    return (
        <div className="col-lg-6">
            <div className="ca-testimonial-item tp-pp-testimonial-item">
                <div className="tp-testimonial-pp-review-wrap mb-30 d-flex align-content-center justify-content-between">
                    <div className="tp-testimonial-pp-review d-flex align-content-center">
                        <span className="mr-15">
                            <CDotIcon />
                        </span>
                        <div className="tp-testimonial-pp-icon">
                            <div className="d-flex align-items-center mb-5">
                                <span className="tp-testimonial-pp-rating">{rating}</span>
                                {[...Array(5)].map((_, i) => (
                                    <span key={i}>
                                        <StarIconSeven />
                                    </span>
                                ))}
                            </div>
                            <span className="tp-testimonial-pp-based d-block">
                                Based on {reviews} reviews on {platform}
                            </span>
                        </div>
                    </div>
                    <div className="tp-testimonial-pp-qoute">
                        <span>
                            <QuoteIconTwo />
                        </span>
                    </div>
                </div>

                <div className="ca-testimonial-item-content">
                    <p>{content}</p>
                </div>

                <div className="ca-testimonial-item-user d-flex justify-content-between">
                    <div className="ca-testimonial-item-user-content">
                        <span>{role}</span>
                        <h4>{name}</h4>
                    </div>
                    <span className="ca-testimonial-item-user-thumb">
                        <TextLogoIconTwo />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PersonalPTestiItem;