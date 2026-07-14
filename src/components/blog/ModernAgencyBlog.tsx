import { ArrowIconEighteen } from '@/svg/ArrowIcon';
import { ButtonArrowIcon } from '@/svg';
import blogData from '@/data/blogData';
import Link from 'next/link';
import Image from 'next/image';

const ModernAgencyBlog = () => {
    const displayBlogData = blogData.slice(67, 71);
    return (
        <div
            className="ma-blog-ptb pt-120 pb-120 tp-fixed-title-wrap-2"
            style={{ backgroundColor: '#F5F7F5' }}
        >
            <div className="container container-1510">
                <div className="row">
                    {/* LEFT CONTENT */}
                    <div className="col-lg-5">
                        <div className="ma-blog-title-box tp-fixed-title-2">
                            <span className="tp-section-subtitle fs-16 tp-split-title">
                                {'// Our Latest Blog //'}
                            </span>

                            <h3 className="tp-section-title fs-62 tl-unbounded mb-70 tp-split-title">
                                Our latest <br /> news
                            </h3>

                            <div
                                className="tp_fade_anim"
                                data-delay=".5"
                                data-fade-from="top"
                                data-duration="1.1"
                                data-ease="bounce"
                            >
                                <Link href="/blog" className="tp-btn-green btn-h-60 tp-btn-anim">
                                    <div className="tp-btn-text">View All Blog</div>
                                    <span>
                                        <ButtonArrowIcon />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT BLOG LIST */}
                    <div className="col-lg-7">
                        {displayBlogData.map((item) => (
                            <div key={item.id} className="ma-blog-item mb-25">
                                <div className="row">
                                    <div className="col-xl-7">
                                        <div className="ma-blog-content">
                                            <div className="ma-blog-meta">
                                                <span>{typeof item.author === 'string' ? item.author : item.author?.name}</span>
                                                <span>{item.date}</span>
                                            </div>

                                            <h4 className="ma-blog-title">
                                                <Link className="tp-line-black" href={`/blog-details/${item.id}`}>
                                                    {item.title}
                                                </Link>
                                            </h4>

                                            <Link className="ma-blog-link" href={`/blog-details/${item.id}`}>
                                                <span>
                                                    <ArrowIconEighteen />
                                                </span>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="col-xl-5">
                                        <div className="ma-blog-thumb">
                                            <Link href={`/blog-details/${item.id}`}>
                                                <Image width={318} height={230} className="w-100" src={item.image} alt="blog" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModernAgencyBlog;
