import BlogSingleItem from './subComponents/BlogSingleItem';
import { StarIconSix } from '@/svg/StarIcons';
import blogData from '@/data/blogData';

const CorporateAgencyBlog = () => {
    return (
        <div className="cr-blog-area cr-blog-style pt-120 pb-150">
            <div className="container container-1510">
                {/* Blog Header */}
                <div className="cr-blog-top-wrap mb-60">
                    <div className="row align-items-end">
                        <div className="col-xl-6">
                            <div className="cr-blog-title-box">
                                <span className="tp-section-subtitle st-spacegro fs-16 st-dot tp-split-title">
                                    Our Latest Blog
                                </span>
                                <h3 className="tp-section-title tl-spacegro fw-700 fs-60 text-case-int mb-0 tp-split-title">
                                    Expert advice & proven <br /> strategies for
                                </h3>
                            </div>
                        </div>
                        <div className="col-xl-6">
                            <div className="cr-blog-top-text mb-20">
                                <span className="mb-25 d-inline-block">
                                    <StarIconSix />
                                </span>
                                <p>
                                    we are dedicated to driving success through cutting-edge
                                    strategies and innovative solutions. With a strong foundation in
                                    creativity and technology, and digital architects.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blog Items */}
                <div className="row">
                    {blogData.slice(12, 14).map((item, index) => (
                        <BlogSingleItem item={item} key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CorporateAgencyBlog;
