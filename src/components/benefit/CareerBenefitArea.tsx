import { CareerGrowthIcon, CompetitiveSalaryIcon, CreativeCultureIcon, FlexibleHoursIcon, HealthWellnessIcon, LearningGrowthIcon, RemoteWorkIcon, TeamEventsIcon } from "@/svg/BanefitIcons";

const benefitData = [
    {
        title: "Flexible Work Hours",
        Icon: FlexibleHoursIcon,
    },
    {
        title: "Remote Work Options",
        Icon: RemoteWorkIcon,
    },
    {
        title: "Competitive Salary Packages",
        Icon: CompetitiveSalaryIcon,
    },
    {
        title: "Health & Wellness Plans",
        Icon: HealthWellnessIcon,
    },
    {
        title: "Learning & Development",
        Icon: LearningGrowthIcon,
    },
    {
        title: "Creative Work Culture",
        Icon: CreativeCultureIcon,
    },
    {
        title: "Career Growth Pathways",
        Icon: CareerGrowthIcon,
    },
    {
        title: "Team Retreats & Events",
        Icon: TeamEventsIcon,
    },
];



const CareerBenefitArea = () => {
    return (
        <div id="b" className="tp-career-inner-benefit-ptb pt-150 pb-150">
            <div className="container">
                {/* Section Header */}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="tp-career-inner-benefit-wrapper text-center mb-50">
                            <h4 className="tp-section-title fs-42 tl-unbounded fw-600 tt-capitalize mb-20 tp-split-title">
                                Our Benefit
                            </h4>

                            <div
                                className="tp-career-inner-benefit-text tp_fade_anim"
                                data-delay=".3"
                            >
                                <p>
                                    At our agency, {`you're`} not just joining a team {`you're`} becoming
                                    part of a mission. <br />
                                    We believe in pushing boundaries, fuelling creativity,
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefit Grid */}
                <div className="tp-benefit-box tp_fade_anim" data-delay=".5">
                    <div className="row gx-0">
                        {benefitData.map(({ title, Icon }, index) => {
                            const isTopRow = index < 4;
                            const isLastItem = index === benefitData.length - 1;

                            return (
                                <div key={title} className="col-lg-3 col-md-6">
                                    <div
                                        className={`tp-benefit-item ${isTopRow ? "tp-benefit-borber-bottom" : "br"
                                            } ${isLastItem ? "" : ""}`}
                                    >
                                        <div className="tp-benefit-item-icon pb-30">
                                            <span>
                                                <Icon />
                                            </span>
                                        </div>

                                        <h4 className="tp-benefit-item-title">
                                            {title.split(" ").slice(0, 2).join(" ")}
                                            <br />
                                            {title.split(" ").slice(2).join(" ")}
                                        </h4>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerBenefitArea;
