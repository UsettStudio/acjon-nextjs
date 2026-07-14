import ProjectGrid from "./subComponents/ProjectGridColumnTwo";
import { TextArrowIcon } from "@/svg/ArrowIcon";
import Link from "next/link";

const ProjectAreaTwoColumn = () => {
    return (
        <div className="tp-project-area inner-portfolio-2-style pb-155 fix">
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="inner-portfolio-tab-btn pb-40">
                            <ul className="nav nav-tab justify-content-center" id="myTab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className="nav-links active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">all Works</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-links" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">design</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-links" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact-tab-pane" type="button" role="tab" aria-controls="contact-tab-pane" aria-selected="false">development</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-links" id="web-tab" data-bs-toggle="tab" data-bs-target="#web-tab-pane" type="button" role="tab" aria-controls="web-tab-pane" aria-selected="false">marketing</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-links" id="oth-tab" data-bs-toggle="tab" data-bs-target="#oth-tab-pane" type="button" role="tab" aria-controls="oth-tab-pane" aria-selected="false">other</button>
                                </li>
                            </ul>
                        </div>
                        <div className="hr-portfolio-content-wrap">
                            <div className="tab-content" id="myTabContent">

                                <div className="tab-pane fade show active" id="home-tab-pane" role="tabpanel">
                                    <ProjectGrid />
                                </div>

                                <div className="tab-pane fade" id="profile-tab-pane" role="tabpanel">
                                    <ProjectGrid />
                                </div>

                                <div className="tab-pane fade" id="contact-tab-pane" role="tabpanel">
                                    <ProjectGrid />
                                </div>

                                <div className="tab-pane fade" id="web-tab-pane" role="tabpanel">
                                    <ProjectGrid />
                                </div>

                                <div className="tab-pane fade" id="oth-tab-pane" role="tabpanel">
                                    <ProjectGrid />
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="col-xl-12">
                        <div className="tp-portfolio-btn pt-30 text-center tp-fade-anim" data-delay=".3" data-ease="bounce" data-fade-from="top" data-duration="1.2">
                            <Link className="tp-btn-circle tp-hover-btn-item tp-hover-btn" href="#">
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

export default ProjectAreaTwoColumn;