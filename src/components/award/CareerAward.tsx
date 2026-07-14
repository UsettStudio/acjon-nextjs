import { AwardArrowIconTwo } from "@/svg/ArrowIcon";
import Link from "next/link";

const awardData = [
    {
        year: "2012",
        title: "Design Excellence",
        source: "Awards",
    },
    {
        year: "2016",
        title: "Top Designer Award",
        source: "Envato",
    },
    {
        year: "2018",
        title: "Design of the Year",
        source: "CSS Winner",
    },
    {
        year: "2022",
        title: "Satisfaction Award",
        source: "Behance",
    },
    {
        year: "2023",
        title: "Excellence Award",
        source: "Dribble",
    },
    {
        year: "2024",
        title: "Brilliance Award",
        source: "LinkedIn",
    },
];

const CareerAward = () => {
    return (
        <div
            className="tp-career-inner-award-ptb pt-150 pb-150"
            style={{ backgroundColor: "#010103" }}
        >
            <div className="container">
                {/* Header */}
                <div className="row align-items-end">
                    <div className="col-lg-6">
                        <div
                            className="tp-career-inner-award-heading pb-60 tp_fade_anim"
                            data-delay=".3"
                        >
                            <h4 className="tp-section-title fs-42 tl-unbounded fw-600 tt-capitalize mb-20">
                                We’re Currently <br /> Hiring
                            </h4>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div
                            className="tp-career-inner-award-heading pb-60 pl-180 tp_fade_anim"
                            data-delay=".5"
                        >
                            <p>
                                At our agency, {`you're`} not just joining a team <br />
                                {`you're`} becoming part of a mission.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Award List */}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ca-award-item-wrap">
                            {awardData.map(({ year, title, source }) => (
                                <div
                                    key={year}
                                    className="ca-award-item hover-reveal-item p-relative mb-5"
                                >
                                    <div className="row align-items-center">
                                        <div className="col-md-6">
                                            <div className="ca-award-box-left z-index-3">
                                                <span className="ca-award-year">{year}</span>
                                                <span className="ca-award-text">{title}</span>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="ca-award-box-right z-index-3 d-flex justify-content-between align-items-center">
                                                <span className="ca-award-position">{source}</span>

                                                <div className="ca-award-btn">
                                                    <Link
                                                        href="/job-application-form"
                                                        className="tp-btn-green tp-btn-anim"
                                                    >
                                                        <div className="tp-btn-text">Apply Now</div>
                                                        <span>
                                                            <AwardArrowIconTwo />
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerAward;
