import Link from "next/link";
import {
    BlogShapeIconTwo,
    BlogTriangleShapeIcon,
} from "@/svg/ShapeIcons";
import Image from "next/image";

type BlogBreadcrumbStyleFourProps = {
    title?: string;
    currentPage?: string;
    homeLabel?: string;
    homeUrl?: string;
    shapeImage?: string;
};

const BlogBreadcrumbStyleFour = ({
    title = "Blog Listing",
    currentPage = "Blog Listing",
    homeLabel = "Home",
    homeUrl = "/",
    shapeImage = "/assets/img/inner-image/project/details/shape.png",
}: BlogBreadcrumbStyleFourProps) => {
    return (
        <div className="tp-breadcrumb-s9-spacing tp-breadcrumb-s13-spacing z-1 black-bg position-relative">
            {/* Background image */}
            <Image
                width={638}
                height={561}
                className="tp-breadcrumb-s13-shape d-none d-xl-block"
                src={shapeImage}
                alt="breadcrumb shape"
            />

            {/* Floating shape */}
            <span className="tp-breadcrumb-s10-shape d-none d-xl-block" data-speed=".8">
                <BlogShapeIconTwo />
            </span>

            <div className="container position-relative">
                <span
                    className="tp-breadcrumb-s10-shape-2 d-none d-xl-block"
                    data-speed="1.1"
                >
                    <BlogTriangleShapeIcon />
                </span>

                <div className="row">
                    <div className="col-12">
                        <div className="tp-breadcrumb-s9-wrap text-center">
                            <h2 className="tp-breadcrumb-s9-title mb-35 tp-split-title">
                                {title}
                            </h2>

                            <div
                                className="tp-breadcrumb-s9-subtitle d-flex justify-content-center tp_fade_anim"
                                data-delay=".5"
                            >
                                <div className="tp-breadcrumb-s1-subtitle">
                                    <Link href={homeUrl}>{homeLabel}</Link>
                                </div>
                                <span>{currentPage}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogBreadcrumbStyleFour;
