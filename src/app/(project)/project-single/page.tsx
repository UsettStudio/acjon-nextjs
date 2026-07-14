import ProjectSingleCard from "@/components/project/subComponents/ProjectSingleCard";
import { BackToTopArrowIconTwo } from "@/svg/ArrowIcon";
import projectData from "@/data/projectData";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Project Single - Digital Agency & Creative Portfolio",
};

const page = () => {
    const displayProjectsItems = projectData.slice(87, 91); // Display only first 4 items
    return (
        <main>
            <div className="tp-project-area tp-project-single-style tp-fixed-title-wrap mb-160 fix">
                <div className="container container-1510">
                    <div className="row">
                        {/* Left Column */}
                        <div className="col-xl-5">
                            <div className="tp-breadcrumb-s7-content tp-fixed-title mb-40">
                                <h4 className="tp-breadcrumb-s7-title text-uppercase mb-15 tp-split-title">
                                    Work<br /> Project
                                </h4>
                                <div className="tp-breadcrumb-s7-text tp_fade_anim" data-delay=".3">
                                    <p className="mb-50">
                                        We are a forward-thinking digital creative agency<br />
                                        dedicated to crafting impactful brand.
                                    </p>
                                </div>
                                <div className="tp-project-single-backtop tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                    <Link href="#">
                                        <BackToTopArrowIconTwo />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Project Items */}
                        <div className="col-xl-7">
                            <div className="tp-project-full-item-wrap">
                                {displayProjectsItems.map((project) => (
                                    <ProjectSingleCard key={project.id} {...project} />
                                ))}

                                {/* Pagination */}
                                <div className="tp-pagenation-wrap pt-30">
                                    <ul className="justify-content-start">
                                        <li><Link href="/project-single"><i className="fa-solid fa-arrow-left"></i></Link></li>
                                        <li className="active"><Link href="#">1</Link></li>
                                        <li><Link href="/project-single">2</Link></li>
                                        <li><Link href="/project-single">3</Link></li>
                                        <li><Link href="/project-single"><i className="fa-solid fa-arrow-right"></i></Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default page;