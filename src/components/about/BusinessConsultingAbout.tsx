import { BusinessesAboutIcon, FutureAboutIcon, LeadingAboutIcon, StrategiesAboutIcon } from "@/svg/AboutIcons";
import { ArrowIconFive } from "@/svg/ArrowIcon";
import Image from "next/image";
import Link from "next/link";

const aboutItems = [
    {
        id: 1,
        icon: <StrategiesAboutIcon />,
        title: (
            <>
                Future-Ready Strategies <br /> for Sustainable.
            </>
        ),
        desc: "An ever-evolving business landscape requires innovation to stay ahead.",
        delay: ".3",
    },
    {
        id: 2,
        icon: <LeadingAboutIcon />,
        title: (
            <>
                Leading Change, Driving <br /> Innovation.
            </>
        ),
        desc: "An ever-evolving business landscape requires innovation to stay ahead.",
        delay: ".5",
    },
    {
        id: 3,
        icon: <BusinessesAboutIcon />,
        title: (
            <>
                Empowering Businesses <br /> for the Next Era.
            </>
        ),
        desc: "An ever-evolving business landscape requires innovation to stay ahead.",
        delay: ".7",
    },
    {
        id: 4,
        icon: <FutureAboutIcon />,
        title: (
            <>
                Navigating the Future with <br /> Smart Solutions.
            </>
        ),
        desc: "An ever-evolving business landscape requires innovation to stay ahead.",
        delay: ".9",
    },
];

const BusinessConsultingAbout = () => {
    return (
        <div
            className="bnc-about-ptb p-relative pt-100 pb-120"
            style={{ backgroundColor: "#ECF8F8" }}
        >
            {/* Decorative Shape */}
            <div className="bnc-about-shape">
                <Image width={357} height={384} src="/assets/img/business-consulting/about/about-2-shape.png" alt="about shape" />
            </div>

            <div className="container container-1510">
                {/* Top Section */}
                <div className="bnc-about-top-wrap pb-90">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="bnc-about-title-box">
                                <span className="tp-section-subtitle fs-16 st-dot">About us</span>
                                <h3 className="tp-section-title fs-72 tp-text-revel">marketing agency specializes
                                    in crafting data-driven strategies
                                    compelling creative content.
                                </h3>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="bnc-about-right text-lg-end" data-speed="1.1">
                                <Image width={290} height={248} src="/assets/img/business-consulting/about/about-2-thumb.jpg" alt="about thumb" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="bnc-about-bottom-wrap pb-90">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="bnc-about-thumb-wrap tp-clip-anim mb-30">
                                <Image
                                    className="tp-anim-img"
                                    data-animate="true"
                                    src="/assets/img/business-consulting/about/about-1-thumb.jpg"
                                    width={865}
                                    height={498}
                                    alt="about thumb"
                                />
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="bnc-about-content">
                                <div className="bnc-about-content-text">
                                    <p className="tp-text-perspective">
                                        Our business consulting services are designed to unlock the
                                        full potential of your company. With a deep understanding of
                                        industry trends, market dynamics, and business strategies, we
                                        provide expert guidance that drives growth, efficiency, and
                                        long-term success.
                                    </p>
                                    <p className="tp-text-perspective">
                                        Whether you are a start-up seeking direction or an established
                                        enterprise looking to scale, our tailored solutions ensure your
                                        success.
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="bnc-about-content-btn-box d-flex">
                                    <AboutButton
                                        label="About Us"
                                        href="/about"
                                        delay=".3"
                                        variant="filled"
                                    />
                                    <AboutButton
                                        label="More Services"
                                        href="/service"
                                        delay=".5"
                                        variant="outline"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Items */}
                <div className="bnc-about-item-box">
                    <div className="row">
                        {aboutItems.map((item) => (
                            <div key={item.id} className="col-lg-3 col-md-6">
                                <div
                                    className="bnc-about-item mb-30 tp_fade_anim"
                                    data-delay={item.delay}
                                >
                                    <div className="bnc-about-item-icon mb-25">
                                        <span>{item.icon}</span>
                                    </div>
                                    <div className="bnc-about-item-content">
                                        <h4 className="bnc-about-item-title">{item.title}</h4>
                                        <p>{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Reusable Button Component */
const AboutButton = ({ label, href, delay, variant = "filled" }: {
    label: string;
    href: string;
    delay?: string;
    variant?: "filled" | "outline";
}) => (
    <div
        className="bnc-about-content-btn tp_fade_anim"
        data-delay={delay}
        data-fade-from="top"
        data-ease="bounce"
    >
        <Link
            href={href}
            className={`tp-btn-green bdr-5 fw-700 ff-bricolage tp-btn-anim ${variant === "outline" ? "bg-none-style" : ""
                }`}
        >
            <div className="tp-btn-text">{label}</div>
            <span>
                <ArrowIconFive />
            </span>
        </Link>
    </div>
);

export default BusinessConsultingAbout;
