import ProjectGridNoGapCard from "./subComponents/ProjectGridNoGapCard";
import projectData from "@/data/projectData";

const ModernAgencyProject = () => {
    const displayNogapProjectData = projectData.slice(55, 61);
    return (
        <div className="ma-project-area pt-120 pb-120 fix">
            <div className="container-fluid p-0">
                <div className="row">
                    <div className="col-xl-12">
                        <div className="ma-project-title-box text-center mb-65">
                            <h2 className="tp-section-title fs-140 tl-unbounded tp-split-title">
                                Features Work
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="row gx-0">
                    {displayNogapProjectData.map((project) => (
                        <ProjectGridNoGapCard key={project.id} {...project} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModernAgencyProject;
