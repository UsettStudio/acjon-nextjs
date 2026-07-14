import { BlogShapeIcon, BlogTriangleShapeIcon } from "@/svg/ShapeIcons";

const BlogBreadcrumbStyleOne = () => {
    return (
        <div className="tp-breadcrumb-s10-style z-1 black-bg position-relative">
            <span className="tp-breadcrumb-s10-shape d-none d-xl-block" data-speed=".8">
                <BlogShapeIcon />
            </span>
            <div className="container position-relative">
                <span className="tp-breadcrumb-s10-shape-2 d-none d-xl-block" data-speed="1.1">
                    <BlogTriangleShapeIcon />
                </span>
                <div className="row">
                    <div className="col-12">
                        <div className="tp-breadcrumb-s10-wrap text-center">
                            <h2 className="tp-breadcrumb-s10-title mb-25 tp-split-title">My Latest Blog<br /> And news</h2>
                            <div className="tp_fade_anim" data-delay=".5">
                                <p className="tp-breadcrumb-s10-subtitle">Insights, and Inspiration for Forward-Thinkers Stay ahead with fresh perspectives,<br />
                                    expert tips, and behind-the-scenes looks into the trends shaping</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogBreadcrumbStyleOne;