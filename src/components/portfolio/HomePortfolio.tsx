import HomePortfolioSingleItem from "./subComponents/HomePortfolioSingleItem";
import { TextArrowIcon } from "@/svg/ArrowIcon";
import projectData from "@/data/projectData";
import Link from "next/link";

const HomePortfolio = () => {
    return (
            <div className="tp-project-ptb pt-130 pb-160">
                <div className="container container-1510">
                    {/* Section Title */}
                    <div className="row justify-content-center">
                        <div className="col-xl-6">
                            <div
                                className="tp-project-title-box text-center mb-35 tp_fade_anim"
                                data-delay=".3"
                            >
                                <h4 className="tp-section-title fs-150 fw-700 tp-split-title">
                                    Our Work
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Items */}
                    <div className="row">
                        {projectData.slice(0, 4).map((item, index) => (
                            <HomePortfolioSingleItem {...item} key={index} />
                        ))}

                        {/* Portfolio Button */}
                        <div className="col-xl-12">
                            <div
                                className="tp-portfolio-btn text-center tp_fade_anim"
                                data-delay=".3"
                                data-ease="bounce"
                                data-fade-from="top"
                                data-duration="1"
                            >
                                <Link
                                    className="tp-btn-circle tp-hover-btn-item tp-hover-btn"
                                    href="/project-single"
                                >
                                    <span>
                                        <TextArrowIcon />
                                    </span>
                                    All Portfolio
                                    <div className="tp-btn-circle-dot"></div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default HomePortfolio;
