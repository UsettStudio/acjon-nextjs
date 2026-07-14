import { projectDt } from "@/types/custom-dt";
import Image from "next/image";
import Link from "next/link";

const ProjectThreeColumnCard: React.FC<projectDt> = ({ id, image, title, year, category }) => {
    return (
        <div className="col-lg-4 col-md-6">
            <div className="tp-project-item mb-50">
                <div className="tp-project-thumb mb-25">
                    <Link href={`/project-details-2/${id}`}>
                        <Image className="img-fluid w-100 h-100" width={479} height={419} src={image} alt={title} />
                    </Link>
                </div>
                <div className="tp-project-content">
                    <h4 className="tp-project-title"><Link className="tp-line-black" href={`/project-details-2/${id}`}>{title}</Link></h4>
                    <span><i>{year}</i>{category}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectThreeColumnCard;