import projectData from "@/data/projectData";
import ProjectGridNoGapCard from "./subComponents/ProjectGridNoGapCard";

const ProjectNoGapArea = () => {
    const displayNogapProjectData = projectData.slice(74, 83); // last 9 items

    // Tab info
    const tabs = [
        { id: "home", label: "all Works" },
        { id: "profile", label: "design" },
        { id: "contact", label: "development" },
        { id: "web", label: "marketing" },
        { id: "oth", label: "other" },
    ];

    return (
        <div className="tp-project-area fix">
            <div className="container-fluid gx-0">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="inner-portfolio-tab-btn pb-40">
                            <ul className="nav nav-tab justify-content-center" id="myTab" role="tablist">
                                {tabs.map((tab, index) => (
                                    <li className="nav-item" role="presentation" key={tab.id}>
                                        <button
                                            className={`nav-links ${index === 0 ? "active" : ""}`}
                                            id={`${tab.id}-tab`}
                                            data-bs-toggle="tab"
                                            data-bs-target={`#${tab.id}-tab-pane`}
                                            type="button"
                                            role="tab"
                                            aria-controls={`${tab.id}-tab-pane`}
                                            aria-selected={index === 0}
                                        >
                                            {tab.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="hr-portfolio-content-wrap">
                            <div className="tab-content" id="myTabContent">
                                {tabs.map((tab, index) => (
                                    <div
                                        className={`tab-pane fade ${index === 0 ? "show active" : ""}`}
                                        id={`${tab.id}-tab-pane`}
                                        role="tabpanel"
                                        aria-labelledby={`${tab.id}-tab`}
                                        tabIndex={0}
                                        key={tab.id}
                                    >
                                        <div className="row gx-0">
                                            {displayNogapProjectData.map((project) => (
                                                <ProjectGridNoGapCard key={project.id} {...project} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectNoGapArea;
