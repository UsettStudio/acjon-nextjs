import CreativeABlogItem from "./subComponents/CreativeABlogItem";
import { ButtonArrowIconTwo } from "@/svg";
import blogData from "@/data/blogData";
import Link from "next/link";

const CreativeAgencyBlog = () => {
    return (
        <div className="ca-blog-ptb pb-140">
            <div className="container container-1410">
                {/* Title Row */}
                <div className="row align-items-end">
                    <div className="col-xxl-6 col-lg-8">
                        <div className="ca-blog-title-box mb-60">
                            <span className="tp-section-subtitle title-white tp-split-title">
                                {`// Our Blog`}
                            </span>
                            <h3 className="tp-section-title tl-unbounded title-white tp-split-title">
                                The Latest blog <br /> From Us
                            </h3>
                        </div>
                    </div>
                    <div className="col-xxl-6 col-lg-4">
                        <div
                            className="ca-blog-btn text-lg-end mb-60 tp_fade_anim"
                            data-delay=".5"
                            data-fade-from="top"
                            data-ease="bounce"
                        >
                            <Link
                                className="tp-btn-green btn-white-bg tp-btn-anim"
                                href="/blog"
                            >
                                <div className="tp-btn-text">See All Blogs</div>
                                <span>
                                    <ButtonArrowIconTwo />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Blog Items */}
                <div className="row">
                    {blogData.slice(6, 9).map((blog, i) => (
                        <CreativeABlogItem {...blog} key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CreativeAgencyBlog;
