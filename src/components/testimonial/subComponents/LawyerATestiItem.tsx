import { useVideoModal } from "@/provider/VideoProvider";
import { testimonialItemDt } from "@/types/custom-dt";
import { VideoPlayIconTwo } from '@/svg';
import Image from 'next/image';
import React from 'react';

const LawyerATestiItem: React.FC<testimonialItemDt> = ({ name, company, image, content, videoUrl }) => {
    const { playVideo } = useVideoModal();

    return (
        <div className="lw-testimonial-item">
            {/* Video Button */}
            <div className="lw-testimonial-item-video mb-50">
                <a onClick={() => { playVideo(`${videoUrl}`) }} className="popup-video">
                    <VideoPlayIconTwo width="13" height="16" fillColor="currentColor" />
                </a>
            </div>

            {/* Text */}
            <div className="lw-testimonial-item-text">
                <p>{content}</p>
            </div>

            {/* Bottom Section */}
            <div className="lw-testimonial-item-bottom d-flex justify-content-between align-items-center">
                <div className="lw-testimonial-item-user d-flex">
                    <div className="lw-testimonial-item-user-thumb">
                        {image && <Image className="img-fluid" width={60} height={60} src={image} alt={name} />}
                    </div>
                    <div className="lw-testimonial-item-user-content">
                        <span>{name}</span>
                        <p>{company}</p>
                    </div>
                </div>

                <div className="lw-testimonial-item-star">
                    <Image className="img-fluid" width={74} height={14} src="/assets/img/lawyer-agency/testimonial/testimonial-star.svg" alt="rating stars" />
                </div>
            </div>
        </div>
    );
};

export default LawyerATestiItem;