import { TextArrowIcon } from '@/svg/ArrowIcon';
import { ServiceItemDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface serviceProps {
    service: ServiceItemDt
}

const HomeSingleServiceItem: React.FC<serviceProps> = ({ service }) => {
    return (
        <div className="tp-service-item mb-30">
            <div className="tp-service-item-icon">
                {service.icon && <Image width={65} height={65} src={service.icon} alt={service.title} />}
            </div>
            <h4 className="tp-service-item-title"><Link className="tp-line-lr" href={`/service-details/${service.id}`}>Data content</Link></h4>
            <p dangerouslySetInnerHTML={{ __html: service.description }} />
            <div className="tp-service-item-btn">
                <Link className=" tp-btn-anim tp-doubble-effect" href={`/service-details/${service.id}`}>
                    <div className="tp-btn-text">Read More</div>
                    <i>
                        <TextArrowIcon />
                        <TextArrowIcon />
                    </i>
                </Link>
            </div>
        </div>
    );
};
export default HomeSingleServiceItem;
