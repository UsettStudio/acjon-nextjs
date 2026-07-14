import { ServiceItemDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const CorporateAServiceItem: React.FC<ServiceItemDt> = ({ id, image, category, title, description }) => {
    return (
        <div className="cr-service-item p-relative">
            <span className="cr-service-category">{category}</span>
            <div className="cr-service-thumb">
                {image && <Image className='img-fluid w-100 h-auto' width={475} height={536} src={image} alt={title} />}
            </div>
            <div className="cr-service-content">
                <h4 className="cr-service-title">
                    <Link className="tp-line-white" href={`/service-details/${id}`}>
                        {title}
                    </Link>
                </h4>
                <p dangerouslySetInnerHTML={{ __html: description }} />
            </div>
        </div>
    );
};

export default CorporateAServiceItem;