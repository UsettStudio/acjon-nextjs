import blogData from "@/data/blogData";
import Image from "next/image";
import Link from "next/link";

const TeamBlog = () => {
    //display blog data
    const displayBlogData = blogData.slice(28, 31);

    return (
        <div className="tp-team-detils-blog-ptb pb-130">
            <div className="container container-1480">
                <div className="tp-team-details-blog-wrap">
                    <div className="row">
                        {displayBlogData.map((item) => (
                            <div key={item.id} className="col-xxl-4 col-lg-6">
                                <div
                                    className="dgm-blog-item p-relative mb-30 tp_fade_anim"
                                    data-delay={item.delay}
                                >
                                    <div className="dgm-blog-thumb">
                                        <Image style={{width:"100%", height:"auto"}} className="img-fluid" width={469} height={456} src={item.image} alt="Team blog" />
                                    </div>

                                    <div className="dgm-blog-content d-flex flex-column justify-content-between">
                                        <div className="dgm-blog-content-inner">
                                            <div className="dgm-blog-meta">
                                                <span>- News</span>
                                                <span>{item.date}</span>
                                            </div>

                                            <h4 className="dgm-blog-title">
                                                <Link
                                                    href={`/blog-details/${item?.id}`}
                                                    className="tp-line-black"
                                                >
                                                    {item.title}
                                                </Link>
                                            </h4>
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

export default TeamBlog;
