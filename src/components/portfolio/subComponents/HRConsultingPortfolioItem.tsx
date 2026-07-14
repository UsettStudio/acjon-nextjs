import { projectDt } from '@/types/custom-dt';
import { ArrowIconTwelve } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const HRConsultingPortfolioItem: React.FC<projectDt> = ({ id, image, title, category, date }) => {
    return (
        <div className="col-xl-4 col-md-6">
            <div className="hr-portfolio-item mb-30">
                <div className="hr-portfolio-thumb p-relative">
                    <Link href={`/project-details/${id}`}>
                        <Image className='img-fluid w-100 h-100' width={406} height={399} src={image} alt={title} />
                    </Link>
                    <Link className="hr-portfolio-link" href={`/project-details/${id}`}>
                        <span>
                            <ArrowIconTwelve />
                        </span>
                    </Link>
                </div>

                <div className="hr-portfolio-content">
                    <div className="hr-portfolio-meta">
                        <span>{category}</span>
                        <span>{date}</span>
                    </div>
                    <h4 className="hr-portfolio-title">
                        <Link className="tp-line-white" href={`/project-details/${id}`}>
                            {title}
                        </Link>
                    </h4>
                </div>
            </div>
        </div>
    );
};

export default HRConsultingPortfolioItem;