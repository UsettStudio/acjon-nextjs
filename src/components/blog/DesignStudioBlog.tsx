import DesignStudioBlogItem from "./subComponents/DesignStudioBlogItem";
import { ButtonArrowIcon } from "@/svg";
import blogData from "@/data/blogData";
import Link from "next/link";

const DesignStudioBlog = () => {
    return (
        <section className="ds-blog-ptb p-relative pt-150 pb-130">
            <div className="ds-blog-big-text">
                <span>Design Studio</span>
            </div>

            <div className="container container-1510">
                {/* ===== Heading Section ===== */}
                <div className="row align-items-end">
                    <div className="col-lg-6">
                        <div className="ds-blog-heading mb-50">
                            <h3 className="tp-section-title tl-unbounded tp-split-title">
                                Our latest <br /> news insights
                            </h3>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div
                            className="ds-blog-btn text-lg-end mb-50 tp_fade_anim"
                            data-delay=".4"
                        >
                            <Link href="/blog" className="tp-btn-green btn-h-60 tp-btn-anim">
                                <div className="tp-btn-text">See All Blog</div>
                                <span>
                                    <ButtonArrowIcon />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ===== Blog Posts ===== */}
                <div className="row">
                    {blogData.slice(17, 20).map((post, index) => (
                        <DesignStudioBlogItem {...post} key={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DesignStudioBlog;
