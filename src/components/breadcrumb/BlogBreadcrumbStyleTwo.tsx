import RecentBlogItem from "../blog/subComponents/RecentBlogItem";
import blogData from "@/data/blogData";

const BlogBreadcrumbStyleTwo = () => {
    //display blog data
    const displayBlogData = blogData.slice(37, 40);
    return (
        <div className="tp-breadcrumb-s11-style z-1 position-relative">
            <h2 className="tp-service-inner-2-bigtext tp-item-anime-md marque d-none d-lg-block">article</h2>
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-7">
                        <div className="tp-service-inner-2-title tp-breadcrumb-s10-wrap">
                            <h3 className="tp-breadcrumb-s7-title mb-35 tp-split-title">Most popular<br /> agency articles.</h3>
                            <span className="tp-section-subtitle tp_fade_anim" data-delay=".3">Our Blog</span>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="tp-blog-inner-top tp_fade_anim" data-delay=".5">
                            {displayBlogData.map((item) => (
                                <RecentBlogItem key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogBreadcrumbStyleTwo;