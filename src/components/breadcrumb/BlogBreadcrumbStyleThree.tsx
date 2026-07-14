import {
    BlogTriangleShapeIcon,
    ServiceTwoShapeIcon,
} from "@/svg/ShapeIcons";
import Image from "next/image";

type BlogBreadcrumbStyleThreeProps = {
    title?: string;
    highlightImage?: string;
    subtitle?: string;
    description?: string;
};

const BlogBreadcrumbStyleThree = ({
    title = "Custom Website Design",
    highlightImage = "/assets/img/breadcrumb/thumb.png",
    subtitle = "Our Latest Blog",
    description =
    "We are seeking a Product Designer to join our team at Acjon. In this role, you will help craft and interactive elements of our software products.",
}: BlogBreadcrumbStyleThreeProps) => {
    return (
        <div className="tp-breadcrumb-s10-style tp-breadcrumb-s12-style z-1 black-bg position-relative">
            {/* Background Shape */}
            <span
                className="tp-breadcrumb-s7-shape d-none d-xl-block"
                data-speed=".8"
            >
                <ServiceTwoShapeIcon color="#F5F7F5" width="120" height="120" />
            </span>

            <div className="container">
                <div className="row">
                    {/* Title */}
                    <div className="col-12">
                        <div className="tp-breadcrumb-s10-wrap">
                            <h4 className="tp-breadcrumb-s7-title text-white mb-35 tp-split-title">
                                {title} <br />
                                <Image className="img-fluid" width={199} height={77} src={highlightImage} alt="breadcrumb thumb" /> & Full-Stack.
                                <span className="ml-30">
                                    <BlogTriangleShapeIcon />
                                </span>
                            </h4>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="col-xxl-9 offset-xxl-2">
                        <div
                            className="tp-breadcrumb-s7-content-wrap tp_fade_anim"
                            data-delay=".5"
                        >
                            <div className="row">
                                <div className="col-lg-3">
                                    <div className="tp-breadcrumb-s7-subtitle mb-20">
                                        <div className="tp-breadcrumb-s1-subtitle">
                                            {subtitle}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-9">
                                    <div className="tp-breadcrumb-s7-content">
                                        <p className="mb-30">{description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogBreadcrumbStyleThree;
