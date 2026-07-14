import { DribbbleIconTwo, InstragramIconTwo, TwitorIconFour } from "@/svg/SocialIcons";
import BlogDetailsContent from "./BlogDetailsContent";
import DigitalMBlogItem from "./subComponents/DigitalMBlogItem";
import { IdProps } from "@/types/custom-dt";
import { EditIcon } from "@/svg/blogIcons";
import blogData from "@/data/blogData";
import { FacebookIcon } from "@/svg";
import Image from "next/image";
import Link from "next/link";

const BlogDetailsTwoMain = ({ id }: IdProps) => {
    // Find the blog that matches the given ID
    const blog = blogData.find((blog) => blog.id == id);
    return (
        <>
            {/* details information */}
            <div className="tp-blog-sidebar-area postbox-details-without-ptb">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="postbox-wrapper">
                                <article className="postbox-details-item item-border text-md-center">
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
                                            }}
                                        />
                                        <div className="postbox-details-meta d-flex align-items-center justify-content-center">
                                            <div className="postbox-author-box d-flex align-items-xl-center justify-content-center">
                                                <div className="postbox-details-author-img mb-10 mr-15">
                                                    <Image width={52} height={52} src="/assets/img/inner-image/blog/standard/blog-av-1.jpg" alt="" />
                                                </div>
                                                <div className="postbox-author-info-wrap d-flex align-items-center flex-wrap">
                                                    <div className="postbox-author-info text-start mr-35 mb-10">
                                                        <span>Author</span>
                                                        <h4 className="postbox-author-name">
                                                            {typeof blog?.author === "object"
                                                                ? blog.author.name
                                                                : "Phil Martinez"}
                                                        </h4>
                                                    </div>
                                                    <div className="postbox-author-info text-start mr-35 mb-10">
                                                        <span>Published on:</span>
                                                        <h4 className="postbox-author-name">{blog?.date || "September 15, 2025"}</h4>
                                                    </div>
                                                    <div className="postbox-author-info text-start mb-10">
                                                        <span>0 comments</span>
                                                        <h4 className="postbox-author-name">Join the conversation</h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* postbox area */}
            <div className="postbox-area">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-12">
                            <div className="tp-blog-details-banner fix mb-55">
                                <Image data-speed=".8" width={1486} height={851} className="img-fluid w-100" src="/assets/img/inner-image/blog/details/no-sidebar/bg.jpg" alt='blog thumb' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-2">
                            <div className="tp-blog-details-social ml-55">
                                <div className="tp_fade_anim" data-delay=".9" data-fade-from="top" data-ease="bounce">
                                    <Link href="#">
                                        <span><FacebookIcon /></span>
                                    </Link>
                                </div>
                                <div className="tp_fade_anim" data-delay=".7" data-fade-from="top" data-ease="bounce">
                                    <Link href="#">
                                        <span><TwitorIconFour /></span>
                                    </Link>
                                </div>
                                <div className="tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                    <Link href="#">
                                        <span><DribbbleIconTwo /></span>
                                    </Link>
                                </div>
                                <div className="tp_fade_anim" data-delay=".3" data-fade-from="top" data-ease="bounce">
                                    <Link href="#">
                                        <span><InstragramIconTwo /></span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-8 col-xl-8 col-lg-8">
                            <div className="postbox-wrapper mb-105">
                                {/* details content */}
                                <BlogDetailsContent />
                            </div>
                        </div>
                        <div className="col-lg-2"></div>
                    </div>
                </div>
            </div>
            {/* postbox area end */}
            {/* blog-area-start */}
            <div className="tp-blog-area tp-blog-details-show-spacing">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-12">
                            <h2 className="postbox-title fs-34 mb-50 tp-split-title">news description</h2>
                        </div>
                        {blogData.slice(3, 6).map((blog, index) => (
                            <DigitalMBlogItem {...blog} key={index} />
                        ))}
                    </div>
                </div>
            </div>
            {/* blog-area-end */}
        </>
    );
};

export default BlogDetailsTwoMain;