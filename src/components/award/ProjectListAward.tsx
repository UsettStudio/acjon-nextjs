import ImageHoverRevealProvider from "@/provider/ImageHoverRevealProvider";
import awardData from "@/data/awardData";
import Link from "next/link";

const ProjectListAward = () => {
    // Select specific award projects by their IDs
    const displayAwardProjects = awardData.slice(17, 23); // IDs of projects to display

    return (
        <ImageHoverRevealProvider>
            <div className="ca-award-ptb inner-award-style tp-project-list-style pb-160">
                <div className="container container-1410">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="ca-award-item-wrap">
                                {displayAwardProjects.map((item) => (
                                    <Link key={item.id} href={`/project-details/${item.id}`}
                                        className="d-block ca-award-item hover-reveal-item p-relative"
                                    >
                                        <div className="row align-items-center">
                                            <div className="col-md-9">
                                                <div className="ca-award-box-left z-index-3 d-flex align-items-center flex-wrap">
                                                    <span className="ca-award-year">{item.year}</span>
                                                    <div className="tp-project-list-tag-wrap d-inline-block">
                                                        <h4 className="ca-award-text mb-20">
                                                            {item.title}
                                                        </h4>
                                                        <div className="tp-project-list-tag">
                                                            {item?.tags?.map((tag, index) => (
                                                                <span style={{ marginRight: "5px" }} key={index}>{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="ca-award-box-right z-index-3 d-flex justify-content-md-end">
                                                    <span className="ca-award-position">
                                                        {item.position}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="tp-award-reveal-img"
                                            style={{ backgroundImage: `url(${item.image})` }}
                                        ></div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ImageHoverRevealProvider>
    );
};

export default ProjectListAward;
