import { blogDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface blogProps {
    blog: blogDt;
    imgAnim?: string
}
const HomeBlogItem: React.FC<blogProps> = ({ blog, imgAnim = "tp-anim-img" }) => {
    return (
        <div className="tp-blog-item text-center mb-40">
            <div className="tp-blog-thumb p-relative">
                <Link
                    href={`/blog-details/${blog.id}`}
                    className="tp-round-24 w-100 fix p-relative d-inline-block"
                >
                    <div className="w-100 tp-clip-anim">
                        <Image
                            width={479}
                            height={457}
                            className={`tp-round-24 w-100 ${imgAnim}`}
                            data-animate="true"
                            src={blog.image}
                            alt={blog.title}
                        />
                    </div>
                </Link>
            </div>
            <div className="tp-blog-content">
                <div className="tp-blog-meta">
                    <span>{blog.date}</span>
                    <span>{blog.category}</span>
                </div>
                <h4 className="tp-blog-title">
                    <Link
                        className="tp-line-black"
                        href={`/blog-details/${blog.id}`}
                        dangerouslySetInnerHTML={{ __html: blog.title }}
                    />
                </h4>
            </div>
        </div>
    );
};

export default HomeBlogItem;