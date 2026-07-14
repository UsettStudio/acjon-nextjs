import { ProjectArrowIcon } from "@/svg/ArrowIcon";
import { projectDt } from "@/types/custom-dt";
import Image from "next/image";
import Link from "next/link";

const ProjectSingleCard: React.FC<projectDt> = ({ id, title, image, category, year }) => {
    return (
        <div className="tp-project-full-item mb-30">
            <div className="tp-project-full-thumb cursor-hide position-relative">
                <Image width={857} height={573} className="img-fluid w-100" src={image} alt={title} />
                <div className="tp-project-content tp-project-full-content d-flex justify-content-between flex-wrap gap-2">
                    <div className="tp-project-sngle-titlr">
                        <h4 className="tp-project-title mb-10">
                            <Link href={`/project-details/${id}`} className="tp-line-black">
                                {title}
                            </Link>
                        </h4>
                        <span><i>{year}</i>{category}</span>
                    </div>
                    <Link className="tp-project-single-btn" href={`/project-details/${id}`}>
                        <ProjectArrowIcon />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProjectSingleCard;