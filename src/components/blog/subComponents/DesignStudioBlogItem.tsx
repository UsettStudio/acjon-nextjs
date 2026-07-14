import { blogDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const DesignStudioBlogItem: React.FC<blogDt> = ({ id, delay, avatar, author, date, image, title }) => {
    return (
        <div key={id} className="col-xl-4 col-lg-6">
            <div
                className="ds-blog-item z-index-1 mb-30 tp_fade_anim"
                data-delay={delay}
            >
                {/* Author & Date */}
                <div className="ds-blog-item-des-wrap p-relative d-flex justify-content-between align-items-center">
                    <div className="ds-blog-item-user d-flex">
                        <div className="ds-blog-item-user-thumb">
                            {avatar && <Image width={40} height={40} src={avatar} alt="User Image" />}
                        </div>
                        <div className="ds-blog-item-user-title-warp">
                            <h4 className="ds-blog-item-user-title">{typeof author === 'string' ? author : author?.name}</h4>
                        </div>
                    </div>
                    <div className="ds-blog-item-date">
                        <span>{date}</span>
                    </div>
                </div>

                {/* Thumbnail */}
                <div className="ds-blog-item-thumb fix">
                    <Link href={`/blog-details/${id}`}>
                        <Image className='img-fluid w-100 h-auto' width={431} height={405} src={image} alt={title} />
                    </Link>
                </div>

                {/* Content */}
                <div className="ds-blog-item-content p-relative">
                    <h3 className="ds-blog-item-title">
                        <Link className="tp-line-black" href={`/blog-details/${id}`}
                            dangerouslySetInnerHTML={{ __html: title }}
                        />
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default DesignStudioBlogItem;