import { ServiceItemDt } from '@/types/custom-dt';
import { ArrowIconFive } from '@/svg/ArrowIcon';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const LawyerAServiceItem: React.FC<ServiceItemDt> = ({ id, title, image, description }) => {
    return (
        <div className="lw-service-item p-relative">
            <div className="lw-service-thumb">
                <Link href={`/service-details/${id}`}>
                    {image && <Image className='img-fluid img-100 img-100' width={459} height={517} src={image} alt={title} />}
                </Link>
            </div>
            <div className="lw-service-content-wrap d-flex justify-content-between align-items-end">
                <div className="lw-service-content">
                    <h4 className="lw-service-title">
                        <Link className="tp-line-white" href={`/service-details/${id}`}>
                            {title}
                        </Link>
                    </h4>
                    <p dangerouslySetInnerHTML={{ __html: description }} />
                </div>
                <Link className="lw-service-link" href={`/service-details/${id}`}>
                    <span>
                        <ArrowIconFive />
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default LawyerAServiceItem;