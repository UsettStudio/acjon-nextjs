import projectData from "@/data/projectData";
import { TextArrowIcon } from "@/svg/ArrowIcon";
import Image from "next/image";
import Link from "next/link";


const ProjectMesonary = () => {
    // Split project data for two columns
    const projectItems1 = projectData.slice(83, 85);
    const projectItems2 = projectData.slice(85, 87);

    return (
        <div className="tp-project-area pb-160 inner-portfolio-2-style tp-project-mesonary-style">
            <div className="container">
                <div className="row">
                    {/* Left Column */}
                    <div className="col-lg-7 order-1 order-lg-0">
                        {projectItems1.map((project) => (
                            <div className="tp-project-item tp-project-mesonary-item mb-95 mr-60" key={project.id}>
                                <div className="tp-project-thumb mb-25">
                                    <Link href={`/project-details/${project.id}`} className="cursor-hide" data-cursor="View<br>Demo">
                                        <Image className="img-fluid w-100 h-100" width={704} height={696} src={project.image} alt="Mesonary thumb" />
                                    </Link>
                                </div>
                                <div className="tp-project-content">
                                    <span className="mb-15 d-inline-block"><i>{project.year}</i>{project.category}</span>
                                    <h4 className="tp-project-title">
                                        <Link className="tp-line-black" href={`/project-details/${project.id}`}>{project.title}</Link>
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column */}
                    <div className="col-lg-5 order-0 order-lg-1">
                        <div className="tp-project-mesonary-title-wrap mb-80">
                            <h2 className="tp-breadcrumb-s7-title text-uppercase tp-split-title">Work<br />Masonry</h2>
                        </div>
                        {projectItems2.map((project) => (
                            <div className="tp-project-item tp-project-mesonary-item mb-95" key={project.id}>
                                <div className="tp-project-thumb mb-25">
                                    <Link href={`/project-details/${project.id}`} className="cursor-hide" data-cursor="View<br>Demo">
                                        <Image className="img-fluid w-100 h-100" width={539} height={547} src={project.image} alt="Mesonary thumb" />
                                    </Link>
                                </div>
                                <div className="tp-project-content">
                                    <span className="mb-15 d-inline-block"><i>{project.year}</i>{project.category}</span>
                                    <h4 className="tp-project-title">
                                        <Link className="tp-line-black" href={`/project-details/${project.id}`}>{project.title}</Link>
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    <div className="col-xl-12 order-2 order-lg-2">
                        <div
                            className="tp-portfolio-btn text-center tp-fade-anim"
                            data-delay=".3"
                            data-ease="bounce"
                            data-fade-from="top"
                            data-duration="1.2"
                        >
                            <Link className="tp-btn-circle tp-hover-btn-item tp-hover-btn" href="/project-mesonary">
                                <span>
                                    <TextArrowIcon />
                                </span>
                                Load More
                                <div className="tp-btn-circle-dot"></div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectMesonary;
