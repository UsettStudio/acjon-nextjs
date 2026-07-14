import projectData from "@/data/projectData";
import Image from "next/image";
import Link from "next/link";

const ProjectGrid = () => {
    return (
        <div className="row">
            {projectData.slice(61, 69).map((item) => (
                <div className="col-lg-6 mb-50" key={item.id}>
                    <div className="tp-project-item">
                        <div className="tp-project-thumb mb-25">
                            <Link href={`/project-details/${item.id}`}>
                                <Image className="img-fluid w-100 h-100" width={731} height={638} src={item.image} alt={item.title} />
                            </Link>
                        </div>
                        <div className="tp-project-content">
                            <h4 className="tp-project-title">
                                <Link className="tp-line-black" href={`/project-details/${item.id}`}>
                                    {item.title}
                                </Link>
                            </h4>
                            <span>
                                <i>{item.year}</i> {item?.category}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectGrid;
