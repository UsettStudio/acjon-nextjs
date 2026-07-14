import { AboutLineIcon } from "@/svg/ShapeIcons";
import { ArrowIconFive } from "@/svg/ArrowIcon";
import Image from "next/image";
import Link from "next/link";

interface PersonalPortfolioAboutProps {
    titleClassName?: string;
    sectionPaddingClass?: string;
    contentPaddingClass?: string;
    imageParallaxSpeed?: string | number;
    shapeParallaxSpeed?: string | number;
    textPerspectiveClass?: string;
}

const PersonalPortfolioAbout = ({
    titleClassName = "",
    sectionPaddingClass = "pt-60",
    contentPaddingClass = "pt-80 pb-70",
    imageParallaxSpeed = "",
    shapeParallaxSpeed = "",
    textPerspectiveClass = "",
}: PersonalPortfolioAboutProps) => {
    return (
        <div
            className={`d-flex align-items-center justify-content-start position-relative z-index-1 fix ${sectionPaddingClass} h-100`}
        >
            <div className={`tp-about-me-ab-area p-relative ${contentPaddingClass} w-100`}>
                <div
                    data-speed={shapeParallaxSpeed}
                    className="tp-about-me-ab-shape"
                >
                    <AboutLineIcon />
                </div>

                <div className="tp-about-me-ab-text">
                    <h4>About</h4>
                </div>

                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="tp-about-me-ab-heading mb-50">
                                <h4 className={`tp-about-me-ab-title ${titleClassName}`}>
                                    I&apos;m Cassian Thor, a passionate <br />
                                    designer dedicated crafting visually <br />
                                    stunning and user-friendly.
                                </h4>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="tp-about-me-ab-thumb">
                                <Image
                                    className="img-fluid w-100 h-100"
                                    data-speed={imageParallaxSpeed}
                                    width={426}
                                    height={369}
                                    src="/assets/img/inner-image/about-me/about-me-shape-1.png"
                                    alt="about shape"
                                />
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="tp-about-me-ab-wrap">
                                <p className={textPerspectiveClass}>I&apos;m Cassian Thor, a passionate designer dedicated to crafting visually <br />
                                    stunning and user friendly digital experiences. With a keen eye for detail <br />
                                    and a deep understanding of design principles, I bring ideas to life <br />
                                    through creativity, strategy, and innovation.</p>
                                <p className={textPerspectiveClass}>creating meaningful connections between brands and their audiences. <br />
                                    My work focuses on blending aesthetics with functionality, ensuring that <br />
                                    design not only looks great but also enhances usability, </p>

                                <div className="tp-about-me-ab-btn-wrap pt-20">
                                    <Link
                                        className="tp-about-me-ab-btn"
                                        href="assets/img/cv/mycv.docx"
                                    >
                                        Download CV{" "}
                                        <span>
                                            <ArrowIconFive />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalPortfolioAbout;
