import { blogDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const DigitalMBlogItem: React.FC<blogDt> = ({ id, delay, image, title, avatar, author, category, date }) => {
    return (
        <div className="col-xxl-4 col-lg-6">
            <div
                className="dgm-blog-item p-relative mb-30 tp_fade_anim"
                data-delay={delay}
            >
                <div className="dgm-blog-thumb">
                    <Image width={479} height={456} src={image} alt={title} />
                </div>
        
                <div className="dgm-blog-content d-flex flex-column justify-content-between">
                    <div className="dgm-blog-avater d-flex align-items-center">
                        {avatar && <Image width={40} height={40} src={avatar} alt={typeof author === 'string' ? author : 'Blog author'} />}
                        <span>{typeof author === 'string' ? author : author?.name}</span>
                    </div>

                    <div className="dgm-blog-content-inner">
                        <div className="dgm-blog-meta">
                            <span>- {category}</span>
                            <span>{date}</span>
                        </div>
                        <h4 className="dgm-blog-title">
                            <Link className="tp-line-white" href={`/blog-details/${id}`}>
                                {title}
                            </Link>
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalMBlogItem;