import { projectDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const BusinessCPortfolioItem: React.FC<projectDt> = ({ id, image, category, title }) => {
    return (
        <div className="dgm-blog-item bnc-portfolio-item p-relative mb-30">
            <div className="dgm-blog-thumb">
                <Image width={527} height={456} src={image} alt="portfolio image"/>
            </div>
            <div className="dgm-blog-content d-flex flex-column justify-content-between">
                <div className="bnc-portfolio-item-tag">
                    <span>{category}</span>
                </div>
                <div className="dgm-blog-content-inner">
                    <h4 className="bnc-portfolio-item-title">
                        <Link className="tp-line-white" href={`/project-details/${id}`}>
                            {title}
                        </Link>
                    </h4>
                </div>
            </div>
        </div>
    );
};

export default BusinessCPortfolioItem;