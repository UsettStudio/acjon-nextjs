import { ServiceItemDt } from '@/types/custom-dt';
import { ArrowIconSeven } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const HRConsultingServiceItem: React.FC<ServiceItemDt> = ({ id, image, delay, title, description, num }) => {
    return (
        <div className="col-xxl-4 col-md-6">
            <div className="hr-service-item mb-30 tp_fade_anim" data-delay={delay}>
                <div className="hr-service-head mb-70 d-flex align-items-center justify-content-between">
                    <span>{num}
                        <i></i>
                    </span>
                    {image && <Image width={120} height={120} src={image} alt={`Service ${id}`} />}
                </div>
                <div className="hr-service-body">
                    <h4 className="hr-service-title">
                        <Link className="tp-line-black" href={`/service-details/${id}`}>
                            {title}
                        </Link>
                    </h4>
                    <p>{description}</p>
                </div>
                <div className="hr-service-link">
                    <Link className="tp-btn-anim d-flex align-items-center" href={`/service-details/${id}`}>
                        <span className="hr-service-link-icon">
                            <ArrowIconSeven />
                        </span>
                        <div className="tp-btn-text">Read More</div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HRConsultingServiceItem;