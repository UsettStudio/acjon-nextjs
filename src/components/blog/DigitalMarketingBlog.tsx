import DigitalMBlogItem from "./subComponents/DigitalMBlogItem";
import blogData from "@/data/blogData";

const DigitalMarketingBlog = () => {
    return (
        <div className="dgm-blog-ptb pb-90">
            <div className="container container-1510">
                <div className="row justify-content-center">
                    <div className="col-xl-8">
                        <div className="dgm-blog-title-box text-center mb-60">
                            <span
                                className="tp-section-subtitle fs-13 st-unbounded st-dot st-border tp_fade_anim"
                                data-delay=".3"
                            >
                                Our Blog
                            </span>
                            <h4 className="tp-section-title tl-unbounded fs-42 tp-split-title">
                                The Future of Design & <br /> Digital Read Now
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {blogData.slice(3, 6).map((blog, index) => (
                        <DigitalMBlogItem {...blog} key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DigitalMarketingBlog;
