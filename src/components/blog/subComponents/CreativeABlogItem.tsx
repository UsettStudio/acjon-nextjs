import { blogDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const CreativeABlogItem: React.FC<blogDt> = ({ id, delay, image, title, date, tag }) => {
    return (
        <div className="col-xl-4 col-lg-6">
            <div
                className="ca-blog-item mb-30 tp_fade_anim"
                data-delay={delay}
            >
                <div className="ca-blog-item-thumb">
                    <Link className="tp-clip-anim" href={`/blog-details/${id}`}>
                        <Image
                            width={446}
                            height={404}
                            className="tp-anim-img"
                            data-animate="true"
                            src={image}
                            alt={title}
                        />
                    </Link>
                </div>
                <div className="ca-blog-item-content">
                    <h4 className="ca-blog-item-title">
                        <Link className="tp-line-white" href={`/blog-details/${id}`}>
                            {title}
                        </Link>
                    </h4>
                    <div className="ca-blog-item-tags">
                        <span>{date}</span>
                        <span>{tag}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreativeABlogItem;