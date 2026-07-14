import BusinessCBlogItem from './subComponents/BusinessCBlogItem';
import blogData from '@/data/blogData';
import { ArrowIconFive } from '@/svg';
import Link from 'next/link';

const BusinessConsultingBlog = () => {
    return (
        <div className="bnc-blog-area bnc-blog-style pt-130 pb-80">
            <div className="container container-1510">
                <div className="row align-items-end">
                    <div className="col-lg-8">
                        <div className="bnc-blog-title-box pb-60">
                            <span className="tp-section-subtitle fs-16 st-dot tp-split-title">Our Blog</span>
                            <h3 className="tp-section-title fs-72 mb-15 tp-split-title">
                                Success Stories <br /> from Our Valued Clients.
                            </h3>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="bnc-blog-btn text-lg-end pb-75 tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                            <Link className="tp-btn-green bdr-5 tp-btn-anim fw-700 ff-bricolage" href="/blog">
                                <div className="tp-btn-text">
                                    See All Services
                                </div>
                                <span>
                                    <ArrowIconFive />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="bnc-blog-item-wrapper">
                    <div className="row">
                        {blogData.slice(14, 17).map((post, index) => (
                            <BusinessCBlogItem {...post} key={index} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessConsultingBlog;