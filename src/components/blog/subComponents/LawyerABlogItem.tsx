import { ArrowIconSeven } from '@/svg';
import { blogDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const LawyerABlogItem: React.FC<blogDt> = ({ id, image, date, title }) => {
    return (
        <div className="col-xl-4 col-md-6">
            <div className="lw-blog-item mb-30">
                <div className="lw-blog-item-thumb">
                    <Link href={`/blog-details/${id}`}>
                        <Image
                            style={{width:"100%", height:"auto"}}
                            width={475}
                            height={500}
                            src={image}
                            alt={title}
                        />
                    </Link>
                </div>

                <div className="lw-blog-item-content">
                    <span className="lw-blog-item-date">{date}</span>
                    <h4 className="lw-blog-item-title">
                        <Link className="tp-line-white" href={`/blog-details/${id}`}>
                            {title}
                        </Link>
                    </h4>

                    <div className="lw-blog-item-btn">
                        <Link
                            className="tp-btn-radius d-inline-flex align-items-center justify-content-between"
                            href={`/blog-details/${id}`}
                        >
                            <span>
                                <span className="text-1">Read More</span>
                                <span className="text-2">Read More</span>
                            </span>
                            <i>
                                <span>
                                    <ArrowIconSeven />
                                    <ArrowIconSeven />
                                </span>
                            </i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerABlogItem;