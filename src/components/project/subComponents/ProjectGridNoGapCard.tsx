import { projectDt } from "@/types/custom-dt";
import Image from "next/image";
import Link from "next/link";

const ProjectGridNoGapCard: React.FC<projectDt> = ({ id, image, title, year, category }) => {
    return (
        <div className="col-lg-4 col-md-6">
            <div className="ma-project-item ds-portfolio-item">
                <div className="ds-portfolio-item-thumb">
                    <Link href={`/project-details/${id}`}><Image className="img-fluid w-100 h-100" width={635} height={713} src={image} alt={title} /></Link>
                </div>
                <div className="ds-portfolio-item-content">
                    <div className="ds-portfolio-item-content-hide">
                        <span>{year} - {category}</span>
                        <h3 className="ds-portfolio-item-title"><Link className="tp-line-black" href={`/project-details/${id}`}>{title}</Link></h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectGridNoGapCard;