import ProjectThreeColumnCard from "./subComponents/ProjectThreeColumnCard";
import projectData from "@/data/projectData";

const ProjectAreaThreeColumn = () => {
    // Alle Usett-prosjektbildene (robust: filtrer på bildesti, ikke array-indeks) – alle 9.
    const displayProjects = projectData.filter(
        (p) => typeof p.image === "string" && p.image.includes("/design-studio/portfolio/usett-")
    );

    return (
        <div className="tp-project-area inner-portfolio-2-style pb-155 fix">
            <div className="container container-1510">
                <div className="row">
                    {
                        displayProjects.map((project) => (
                            <ProjectThreeColumnCard
                                key={project.id}
                                {...project}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default ProjectAreaThreeColumn;
