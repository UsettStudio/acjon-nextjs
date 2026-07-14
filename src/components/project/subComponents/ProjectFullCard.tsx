import { projectDt } from "@/types/custom-dt";
import Image from "next/image";
import Link from "next/link";

const ProjectFullCard: React.FC<projectDt> = ({ id, title, year, category, image }) => {
    return (
        <div className="tp-project-full-item inner-service-3-panel mb-60">
            <Link
                href={`/project-details-2/${id}`}
                className="tp-project-full-thumb cursor-hide position-relative"
                data-cursor="View<br>Demo"
            >
                <Image width={1486} height={790} className="img-fluid w-100" src={image} alt={title} />
                <div className="tp-project-content tp-project-full-content">
                    <h4 className="tp-project-title mb-10">
                        <span className="tp-line-black">{title}</span>
                    </h4>
                    <span>
                        <i>{year}</i>{category}
                    </span>
                </div>
            </Link>
        </div>
    );
};

export default ProjectFullCard;
