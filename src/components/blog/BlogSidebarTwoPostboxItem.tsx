"use client";
import { VideoPlayIconSeven } from "@/svg/VideoPlayIcons";
import { blog_postbox_params } from "@/constants/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { BlogNextPrevIcon } from "@/svg/ArrowIcon";
import { QuoteIconSeven } from "@/svg/QuoteIcons";
import { LinkedIcon } from "@/svg/SocialIcons";
import blogData from "@/data/blogData";
import { ArrowIconTwo } from "@/svg";
import Image from "next/image";
import Link from "next/link";
import { useVideoModal } from "@/provider/VideoProvider";

/* ---------- Types ---------- */
type Author = {
    name: string;
    avatar: string;
    date: string;
    comments: number;
};

/* ---------- Reusable UI ---------- */
const AuthorBox = ({ author }: { author: Author }) => (
    <div className="postbox-author-box d-flex align-items-center mb-20">
        <div className="postbox-author-img">
            <Image width={983} height={621} src={author.avatar} alt={author.name} />
        </div>
        <div className="postbox-author-info">
            <span>{author.name} _ </span>
            <span>{author.date} _ </span>
            <span>{author.comments} comments</span>
        </div>
    </div>
);

/* ---------- Component ---------- */
const BlogSidebarTwoPostboxItem = () => {
    const { playVideo } = useVideoModal();
    // display blog image
    const displayBlogData = blogData.slice(60, 67)

    return (
        <>
            {displayBlogData.map((post) => (
                <article
                    key={post.id}
                    className={`postbox-item position-relative mb-70 ${post.type === "card" || post.type === "quote" || post.type === "linkdin" ? "postbox-card" : ""
                        }`}
                >
                    {/* Media */}
                    {post.type === "image" && post.image && (
                        <div className="postbox-thumb mb-30">
                            <Link href={`/blog-details/${post.id}`}>
                                <Image width={983} height={621} className="img-fluid w-100" src={post.image} alt={post.title} />
                            </Link>
                        </div>
                    )}

                    {post.type === "video" && post.image && (
                        <div className="postbox-thumb position-relative mb-30">
                            <Image width={983} height={621} className="img-fluid w-100" src={post.image} alt={post.title} />
                            <div className="postbox-play-btn">
                                <a onClick={() => { playVideo(post.videoUrl!) }} className="popup-video">
                                    <VideoPlayIconSeven />
                                </a>
                            </div>
                        </div>
                    )}

                    {post.type === "quote" && (
                        <div className="postbox-blockquote mb-35">
                            <blockquote>
                                <div className="postbox-blockquote-post d-sm-flex">
                                    <div className="postbox-blockquote-icon mr-30">
                                        <QuoteIconSeven />
                                    </div>
                                    <div className="postbox-blockquote-des">
                                        {post.quote && <p dangerouslySetInnerHTML={{ __html: post.quote }} />}
                                        <span>{post.quoteAuthor}</span>
                                    </div>
                                </div>
                            </blockquote>
                        </div>
                    )}

                    {post.type === "slider" && post.images && (
                        <div className="postbox-slider-thumb mb-35">
                            <div className="postbox-slider p-relative">
                                <Swiper
                                    className="postbox-slider-active fix"
                                    {...blog_postbox_params}
                                >
                                    {post.images.map((img, i) => (
                                        <SwiperSlide key={i}>
                                            <div className="postbox-slider-item postbox-thumb">
                                                <Image width={983} height={621} className="img-fluid w-100 mb-10" src={img} alt="" />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                <div className="postbox-arrow">
                                    <button className="postbox-arrow-prev">
                                        <span>
                                            <BlogNextPrevIcon direction="left" />
                                        </span>
                                    </button>
                                    <button className="postbox-arrow-next">
                                        <span>
                                            <BlogNextPrevIcon direction="right" />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {post.type === "linkdin" && (
                        <div className="postbox-blockquote mb-35">
                            <blockquote>
                                <div className="postbox-blockquote-post d-sm-flex">
                                    <div className="postbox-blockquote-icon mr-30">
                                        <LinkedIcon />
                                    </div>
                                    <div className="postbox-blockquote-des">
                                        <p className="mb-5">Success is the result of perfection</p>
                                    </div>
                                </div>
                            </blockquote>
                        </div>
                    )}

                    {/* Content */}
                    <span className="postbox-tag">{post.tag}</span>
                    <div className="postbox-content">
                        {post.author && typeof post.author === 'object' && <AuthorBox author={post.author} />}

                        <h3 className="postbox-title mb-15">
                            <Link href={`/blog-details/${post.id}`} dangerouslySetInnerHTML={{ __html: post.title }} />
                        </h3>

                        {post.excerpt && <p className="mb-5"
                            dangerouslySetInnerHTML={{ __html: post.excerpt }}
                        />}

                        <Link
                            className="postbox-btn tp-btn-anim tp-doubble-effect"
                            href={`/blog-details/${post.id}`}
                        >
                            <span className="tp-btn-text">View More</span>
                            <i>
                                <ArrowIconTwo />
                                <ArrowIconTwo />
                            </i>
                        </Link>
                    </div>
                </article>
            ))}
        </>
    );
};

export default BlogSidebarTwoPostboxItem;
