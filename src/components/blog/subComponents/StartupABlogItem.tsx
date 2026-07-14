import { blogDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const StartupABlogItem: React.FC<blogDt> = ({ id, delay, date, tag, title, image }) => {
    return (
        <div className="col-xl-4 col-md-6">
            <div
                className="sa-blog-item tp-circle-link-hover mb-30 tp_fade_anim"
                data-delay={delay}
            >
                <div className="sa-blog-item-content">
                    <h5 className="sa-blog-item-tag">
                        <span>- {tag}</span>{date}
                    </h5>
                    <h4 className="sa-blog-item-title">
                        <Link className="tp-line-black" href={`/blog-details/${id}`}>
                            {title}
                        </Link>
                    </h4>
                </div>
                <div className="sa-blog-item-thumb p-relative">
                    <Link className="tp-clip-anim" href={`/blog-details/${id}`}>
                        <Image
                            width={417}
                            height={269}
                            className="tp-anim-img"
                            data-animate="true"
                            src={image}
                            alt="blog thumbnail"
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StartupABlogItem;