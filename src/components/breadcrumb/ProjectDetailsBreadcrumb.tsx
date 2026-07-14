import { ServiceTwoShapeIcon } from "@/svg/ShapeIcons";
import Image from "next/image";
import Link from "next/link";

const ProjectDetailsBreadcrumb = ({ breadcrumbTitle = "Single Project", subtitle="Single Project" }) => {
    return (
        <div className="tp-breadcrumb-s9-spacing z-1 black-bg position-relative">
            <Image width={610} height={536} className="img-fluid tp-breadcrumb-s9-shape d-none d-xl-block" data-speed="1.1" src="/assets/img/inner-image/project/details/shape.png" alt="shape" />
            <span className="tp-breadcrumb-s9-shape-2 d-none d-xl-block" data-speed=".8">
                <ServiceTwoShapeIcon color="#F5F7F5" width="120" height="120" />
            </span>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="tp-breadcrumb-s9-wrap text-center">
                            <h2 className="tp-breadcrumb-s9-title mb-35 tp-split-title">{breadcrumbTitle}</h2>
                            <div className="tp-breadcrumb-s9-subtitle d-flex justify-content-center tp_fade_anim" data-delay=".5">
                                <div className="tp-breadcrumb-s1-subtitle"><Link href="/">Home</Link></div>
                                <span>{subtitle}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsBreadcrumb;