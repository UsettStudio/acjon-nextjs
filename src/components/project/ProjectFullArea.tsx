import ProjectFullCard from "./subComponents/ProjectFullCard";
import projectData from "@/data/projectData";
import Link from "next/link";

const ProjectFullArea = () => {
    const displayProjectFullData = projectData.slice(70, 74); // Adjusted to get the correct project full width data
    return (
        <div className="tp-project-area tp-project-full-style pb-160 fix">
            <div className="container container-1510">
                <div className="row">
                    <div className="col-12">
                        <div className="tp-project-full-item-wrap inner-service-3-pin-wrap">
                            {displayProjectFullData.map((item) => (
                                <ProjectFullCard
                                    key={item.id}
                                    {...item}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="col-12">
                        <div className="tp-pagenation-wrap tp-pagenation-border pt-60">
                            <ul>
                                <li>
                                    <Link href="/project-full"><i className="fa-solid fa-arrow-left"></i></Link>
                                </li>
                                <li className="active"><Link href="/project-full">1</Link></li>
                                <li><Link href="/project-full">2</Link></li>
                                <li><Link href="/project-full">3</Link></li>
                                <li>
                                    <Link href="/project-full"><i className="fa-solid fa-arrow-right"></i></Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProjectFullArea;
