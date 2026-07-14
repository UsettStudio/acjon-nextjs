import {projectDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const HomePortfolioSingleItem: React.FC<projectDt> = ({id, image, title, year, category }) => {
    return (
        <div className="col-lg-6">
            <div className="tp-project-item mb-50">
                <Link
                    href={`/project-details/${id}`}
                    className="tp-round-24 w-100 fix p-relative d-inline-block mb-25"
                >
                    <div className="tp-project-thumb w-100 tp-clip-anim">
                        <Image
                            width={500}
                            height={500}
                            style={{ width: "100%", height: 'auto' }}
                            className="tp-round-24 w-100 tp-anim-img"
                            data-animate="true"
                            src={image}
                            alt={title}
                        />
                    </div>
                </Link>
                <div className="tp-project-content">
                    <h4 className="tp-project-title">
                        <Link className="tp-line-black" href={`/project-details/${id}`}>
                            {title}
                        </Link>
                    </h4>
                    <span>
                        <i>{year}</i>
                        {category}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default HomePortfolioSingleItem;