import ProjectDetailsBreadcrumb from "@/components/breadcrumb/ProjectDetailsBreadcrumb";
import ProjectDetailsThumb from "@/components/project/subComponents/ProjectDetailsThumb";
import PrevNextProject from "@/components/project/subComponents/PrevNextProject";
import ProjectCategory from "@/components/project/subComponents/ProjectCategory";
import RelatedProject from "@/components/project/RelatedProject";
import projectData from "@/data/projectData";
import { IdProps } from "@/types/custom-dt";
import Image from "next/image";
import Link from "next/link";

const ProjectDetailsMain = ({ id }: IdProps) => {
    // Find the service that matches the given ID
    const project = projectData.find((project) => project.id == id);

    return (
        <>
            <ProjectDetailsBreadcrumb breadcrumbTitle={project?.title || 'Project Details'} subtitle={project?.category || 'Project'} />
            {/* Project Details Area Start */}
            <div className="tp-project-details-area tp-project-details-spacing pt-120 pb-150">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="tp-project-details-banner">
                                <Image data-speed="0.8" width={1326} height={1326} className="img-fluid w-100" src="/assets/img/inner-image/project/details/banner.jpg" alt="banner image" />
                            </div>
                        </div>
                    </div>
                    <div className="tp-project-details-content-wrap pt-110 pb-80 tp-project-details-spacing-3">
                        <div className="row">
                            <div className="col-lg-4">
                                <div className="tp-project-details-cetagory-wrap mb-30">
                                    <h2 className="tp-project-details-title mb-35">Project Details</h2>
                                    <ProjectCategory />
                                </div>
                            </div>
                            <div className="col-lg-8">
                                <div className="tp-project-details-overview-wrap ml-90 mb-30">
                                    <h2 className="tp-project-details-title mb-35">Project Overview</h2>
                                    <p>creative design, and seamless execution. Every project is a journey — from initialbrainstorming to crafting prototypes, refining designs, and final delivery, we ensure quality and creativity remain our top priorities. Our hands-on, transparent approach means you&apos;re involved and informed at every step, guaranteeing results that not only meet expectations but exceed them.
                                        We don&apos;t just deliver projects; we craft experiences that inspire, connect, and grow with your brand. From the first spark of an idea to the final launch, we turn imagination into tangible success.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tp-project-details-thumb-wrap">
                        <ProjectDetailsThumb />
                    </div>
                    <div className="tp-project-details-tag-wrap pt-50">
                        <div className="tp-project-details-tag-border">
                            <div className="row">
                                <div className="col-lg-6 col-md-7">
                                    <div className="tp-project-details-tag d-flex flex-wrap gap-2 mb-20">
                                        <Link href="#">UI/UX Design</Link>
                                        <Link href="#">Developer</Link>
                                        <Link href="#">Photography</Link>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-5">
                                    <div className="tp-project-details-social d-flex justify-content-md-end gap-1 mb-20">
                                        <Link href="#"><i className="fa-brands fa-dribbble"></i></Link>
                                        <Link href="#"><i className="fa-brands fa-behance"></i></Link>
                                        <Link href="#"><i className="fa-brands fa-pinterest"></i></Link>
                                        <Link href="#"><i className="fa-solid fa-share-nodes"></i></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tp-project-navigation-area pt-60">
                        <div className="container-fluid container-1524">
                            <PrevNextProject />
                        </div>
                    </div>
                </div>
            </div>
            {/* Related project section */}
            <RelatedProject />
        </>
    );
};

export default ProjectDetailsMain;