import { TextArrowIcon } from '@/svg/ArrowIcon';
import { ServiceItemDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const CreativeAgencyServiceItem: React.FC<ServiceItemDt> = ({ id, delay, icon, title, description }) => {
    return (
        <div key={id} className="col-lg-4 tp_fade_anim" data-delay={delay}>
            <div className="tp-service-item mb-30">
                <div className="tp-service-item-icon">
                    {icon && <Image className='img-fluid w-auto h-auto' width={64} height={64} src={icon} alt={title} />}
                </div>
                <h4 className="tp-service-item-title">
                    <Link className="tp-line-black" href={`/service-details/${id}`}>
                        {title}
                    </Link>
                </h4>
                <p dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, "<br />") }} />
                <div className="tp-service-item-btn">
                    <Link
                        className="tp-btn-anim d-inline-flex tp-doubble-effect align-items-center"
                        href={`/service-details/${id}`}
                    >
                        <div className="tp-btn-text">Read More</div>
                        <i>
                            <TextArrowIcon />
                            <TextArrowIcon />
                        </i>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CreativeAgencyServiceItem;