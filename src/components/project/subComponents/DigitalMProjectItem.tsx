import { projectDt } from "@/types/custom-dt";
import Image from "next/image";
import Link from "next/link";

interface projectPropsDT {
    project: projectDt
}

const DigitalMProjectItem: React.FC<projectPropsDT> = ({ project }) => {
    return (
        <div className="dgm-portfolio-item p-relative">
            <div className="dgm-portfolio-thumb">
                <Image className="img-fluid w-100 h-100" width={448} height={559} src={project.image} alt="project image" />
            </div>
            <div className="dgm-portfolio-content">
                <h4 className="dgm-portfolio-title"><Link className="tp-line-black" href={`/project-details/${project.id}`}>{project.title}</Link></h4>
                <span>{project.date}</span>
            </div>
        </div>
    );
};

export default DigitalMProjectItem;