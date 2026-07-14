import { blogDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const HRConsultingBlogItem: React.FC<blogDt> = ({ id, image, title, date, category }) => {
    return (
        <div className="tp-blog-item mb-40">
            {/* Blog Thumbnail */}
            <div className="tp-blog-thumb p-relative">
                <Link
                    href={`/blog-details/${id}`}
                    className="tp-round-24 w-100 fix p-relative d-inline-block"
                >
                    <div className="w-100 tp-clip-anim">
                        <Image
                            width={402}
                            height={332}
                            src={image}
                            alt={title}
                            className="tp-round-24 w-100 tp-anim-img"
                            data-animate="true"
                        />
                    </div>
                </Link>
            </div>

            {/* Blog Content */}
            <div className="tp-blog-content">
                <div className="tp-blog-meta">
                    <span>{date}</span>
                    <span>{category}</span>
                </div>

                <h4 className="tp-blog-title">
                    <Link href={`/blog-details/${id}`} className="tp-line-black"
                        dangerouslySetInnerHTML={{ __html: title }}
                    />
                </h4>
            </div>
        </div>
    );
};

export default HRConsultingBlogItem;