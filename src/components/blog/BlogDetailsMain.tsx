import BlogDetailsContent from "./BlogDetailsContent";
import { IdProps } from "@/types/custom-dt";
import { EditIcon } from "@/svg/blogIcons";
import BlogSidebar from "./BlogSidebar";
import blogData from "@/data/blogData";
import Image from "next/image";

const BlogDetailsMain = ({ id }: IdProps) => {
    const blog = blogData.find((item) => item.id == id);

    return (
        <div className="tp-blog-sidebar-area postbox-details-spacing">
            <div className="container container-1510">
                <div className="row">
                    <div className="col-xl-8 col-lg-7">
                        <div className="postbox-wrapper mb-40">
                            <article className="postbox-details-item item-border mb-40">
                                <div className="postbox-details-info-wrap">
                                    <div className="postbox-details-tag">
                                        <span>
                                            <i><EditIcon /></i>
                                            Inspiration
                                        </span>
                                        <span>4 min read</span>
                                    </div>
                                    <h4 className="postbox-title fs-70 mb-40 tp-split-title"
                                        dangerouslySetInnerHTML={{
                                            __html: blog?.title || "Fuelling Innovation Through Content Explore."
                                        }} />
                                    <div className="postbox-details-meta d-flex align-items-center">
                                        <div className="postbox-author-box d-sm-flex align-items-xl-center ">
                                            <div className="postbox-author-img mb-10">
                                                <Image width={40} height={40} src="/assets/img/inner-image/blog/standard/blog-av-1.jpg" alt="author" />
                                            </div>
                                            <div className="postbox-author-info-wrap d-flex align-items-center flex-wrap">
                                                <div className="postbox-author-info mr-35 mb-10">
                                                    <span>Author</span>
                                                    <h4 className="postbox-author-name">
                                                        {typeof blog?.author === "object"
                                                            ? blog.author.name
                                                            : "Phil Martinez"}
                                                    </h4>
                                                </div>
                                                <div className="postbox-author-info mr-35 mb-10">
                                                    <span>Published on:</span>
                                                    <h4 className="postbox-author-name">{blog?.date || "September 15, 2025"}</h4>
                                                </div>
                                                <div className="postbox-author-info mb-10">
                                                    <span>0 comments</span>
                                                    <h4 className="postbox-author-name">Join the conversation</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                            <div className="postbox-details-thumb mb-55">
                                <Image width={983} height={487} className="img-fluid w-100"
                                    src="/assets/img/inner-image/blog/details/thumb.jpg" alt="blog thumb" />
                            </div>
                            {/* details content */}
                            <BlogDetailsContent />
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-5">
                        <BlogSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetailsMain;