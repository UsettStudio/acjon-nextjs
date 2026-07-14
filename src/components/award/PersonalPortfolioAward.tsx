import AnimatedCounterTwo from "../shared/Counter/AnimatedCounterTwo";
import PersonalPAwardItem from "./subComponents/PersonalPAwardItem";
import { AwardDT, SkillDT } from "@/types/custom-dt";
import Image from "next/image";

const skills: SkillDT[] = [
    { id: 1, icon: "/assets/img/inner-image/about-me/icon-1.png", percentage: 95, label: "Figma" },
    { id: 2, icon: "/assets/img/inner-image/about-me/icon-2.png", percentage: 90, label: "Adobe XD" },
    { id: 3, icon: "/assets/img/inner-image/about-me/icon-3.png", percentage: 80, label: "Sketch" },
    { id: 4, icon: "/assets/img/inner-image/about-me/icon-4.png", percentage: 95, label: "After Effects" },
];

const awards: AwardDT[] = [
    { id: 1, title: "Senior UI/UX Designer", role: "UI/UX Design Lead", date: "2026 - Present" },
    { id: 2, title: "Brand Identity", role: "UI/UX Design Lead", date: "2026 - Present" },
    { id: 3, title: "Adobe Creative Suite", role: "UI/UX Design Lead", date: "2026 - Present" },
    { id: 4, title: "Creative Direction", role: "UI/UX Design Lead", date: "2026 - Present" },
];

const PersonalPortfolioAward = ({ sectionBgColor = "#17120A", sectionPaddingClass = "pt-50 pb-50" }) => {
    return (
        <div
            className="d-flex align-items-center justify-content-center h-100"
            style={{ backgroundColor: sectionBgColor }}
        >
            <section className={`tp-about-me-experience-ptb ${sectionPaddingClass} w-100`}>
                <div className="container">
                    <div className="row">
                        {/* Left Column - Experience & Skills */}
                        <div className="col-lg-5">
                            <div className="tp-about-me-experience-wrap">
                                <h4
                                    className="tp-about-me-experience-title tp_fade_anim"
                                    data-delay=".3"
                                >
                                    08 <span>YEARS+</span>
                                </h4>
                                <div
                                    className="tp-about-me-experience-item-wrap d-flex tp_fade_anim"
                                    data-delay=".5"
                                >
                                    <div className="row row-cols-xl-2">
                                        {skills.map(({ id, icon, percentage, label }) => (
                                            <div className="col" key={id}>
                                                <div className="tp-about-me-experience-item d-flex mb-30">
                                                    <div className="tp-about-me-experience-item-icon">
                                                        <span>
                                                            <Image width={26} height={39} src={icon} alt={label} />
                                                        </span>
                                                    </div>
                                                    <div className="tp-about-me-experience-item-content">
                                                        <h4 className="tp-about-me-experience-item-title">
                                                            <AnimatedCounterTwo min={0} max={percentage} />
                                                            %
                                                        </h4>
                                                        <span>{label}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Awards */}
                        <div className="col-lg-7">
                            <div className="tp-about-me-experience-wrapper pl-100 mb-30">
                                <h4
                                    className="tp-about-me-service-title mb-40 tp_fade_anim"
                                    data-delay=".3">
                                    Awards
                                </h4>

                                <div
                                    className="tp-about-me-experience-ex-box tp_fade_anim"
                                    data-delay=".5"
                                >
                                    {awards.map((award, index) => (
                                        <PersonalPAwardItem {...award} key={index} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PersonalPortfolioAward;
