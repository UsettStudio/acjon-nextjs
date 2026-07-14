import { ProjectArrowIconTwo } from '@/svg/ArrowIcon';
import { projectDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const CorporateAPortfolioSliderItem: React.FC<projectDt> = ({ id, image, title, year, category }) => {
    return (
        <div className="ca-project-item">
            <div className="ca-project-item-thumb mb-30">
                <Link href={`/project-details/${id}`}>
                    <Image className='img-fluid w-100 h-auto' width={554} height={462} src={image} alt={title} />
                </Link>
            </div>
            <div className="ca-project-item-wrap d-flex justify-content-between align-items-center">
                <div className="ca-project-item-content">
                    <span>{year} - {category}</span>
                    <h4 className="ca-project-item-title tp-line-white">
                        <Link href={`/project-details/${id}`}>{title}</Link>
                    </h4>
                </div>
                <Link href={`/project-details/${id}`} className="tp-footer-6-input-btn">
                    <span>
                        <ProjectArrowIconTwo />
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default CorporateAPortfolioSliderItem;