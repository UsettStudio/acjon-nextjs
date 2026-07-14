import { testimonialItemDt } from '@/types/custom-dt';
import Image from 'next/image';
import React from 'react';

const StartupATestmonialItem: React.FC<testimonialItemDt> = ({ logo, content, image, name, role }) => {
    return (
        <div className="sa-testimonial-item p-relative">
            <div className="sa-testimonial-item-trust mb-45">
                {logo && <Image width={128} height={53} src={logo} alt="trustpilot logo" />}
            </div>
            <div className="sa-testimonial-item-content">
                <p>{content}</p>
            </div>
            <div className="sa-testimonial-item-user-box d-flex align-items-center">
                <div className="sa-testimonial-item-user-thumb">
                    {image && <Image width={70} height={70} src={image} alt={`${name} photo`} />}
                </div>
                <div className="sa-testimonial-item-user-content">
                    <h4>{name}</h4>
                    <span>{role}</span>
                </div>
            </div>
        </div>
    );
};

export default StartupATestmonialItem;