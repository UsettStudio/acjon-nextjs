import projectData from "@/data/projectData";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const RelatedProject: React.FC = () => {
    const displayRelatedProjects = projectData.slice(97, 100); // Display only first 3 related projects

    return (
        <div className="tp-project-area tp-project-details-spacing-2 pb-130">
            <div className="container">
                <div className="row">
                    {/* Section Title */}
                    <div className="col-lg-12">
                        <div className="tp-project-title-wrap mb-25">
                            <h2>Related Project</h2>
                        </div>
                    </div>

                    {/* Project Items */}
                    {displayRelatedProjects.map((project, index) => (
                        <div key={index} className="col-lg-4 col-md-6 col-sm-6">
                            <div className="tp-project-slide-thumb mb-30 position-relative">
                                <Image
                                    width={426}
                                    height={532}
                                    className="img-fluid w-100"
                                    src={project.image}
                                    alt={project.title}
                                />

                                <div className="tp-project-slide-wrap">
                                    <div className="tp-project-slide-content">
                                        <h3 className="tp-project-slide-title">
                                            <Link href={`/project-details/${project.id}`} className="tp-line-black">
                                                {project.title}
                                            </Link>
                                        </h3>
                                        <span>{project.date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RelatedProject;
