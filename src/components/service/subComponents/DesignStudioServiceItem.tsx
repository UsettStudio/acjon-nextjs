import { ServiceItemDt } from '@/types/custom-dt';
import { ButtonArrowIcon } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const DesignStudioServiceItem: React.FC<ServiceItemDt> = ({ id, title, image }) => {
    return (
        <div className="col-lg-4 col-md-6 tp_fade_anim">
            <div className="ds-service-item text-center mb-30">
                <div className="ds-service-item-wrapper fix">
                    <div className="ds-service-item-box">
                        <div className="ds-service-item-icon">
                            {image && <Image width={60} height={60} className='img-fluid w-auto h-auto' src={image} alt="service icon" />}
                        </div>
                        <h3 className="ds-service-item-title">
                            <Link href="#kontakt-skjema"
                                dangerouslySetInnerHTML={{
                                    __html:  title ,
                                }}>
                            </Link>
                        </h3>
                    </div>
                </div>
                <div className="ds-service-item-btn tp-btn-anim">
                    <Link href="#kontakt-skjema">
                        <div className="tp-btn-text">Les mer</div>
                        <span className="ds-service-item-btn-icon">
                            <ButtonArrowIcon />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DesignStudioServiceItem;