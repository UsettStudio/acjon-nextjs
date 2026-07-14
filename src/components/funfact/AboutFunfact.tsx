import FunfactCircle from "./subComponents/FunfactCircle";
import { AboutFunfactsData } from "@/data/funfactData";
import { TextArrowIconTwo } from "@/svg";
import Link from "next/link";

const AboutFunfact = () => {
    return (
        <div
            className="tp-about-funfact-ptb pt-85 pb-180"
            style={{ backgroundColor: "#F6F6F9" }}
        >
            <div className="container container-1510">
                <div className="row">
                    {/* Funfacts */}
                    <div className="col-lg-6">
                        <div className="tp-about-funfact-wrapper p-relative">
                            {AboutFunfactsData.map((item) => (
                                <FunfactCircle key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="col-lg-6">
                        <div className="tp-about-funfact-heading pt-150 pb-100 pl-130">
                            <span
                                className="tp-section-subtitle st-unbounded st-dot st-border tp_fade_anim"
                                data-delay=".3"
                            >
                                fun facts
                            </span>

                            <h3 className="tp-section-title fs-42 tl-unbounded fw-600 tt-capitalize mb-20 tp-split-title">
                                Creative Services That Business Growth.
                            </h3>

                            <div className="tp_fade_anim" data-delay=".7">
                                <p className="mb-25">
                                    we don’t just create designs—we craft experiences that leave
                                    <br />
                                    a lasting impact. Our team of passionate designers,
                                    strategists,
                                    <br />
                                    and innovators work together.
                                </p>
                            </div>

                            <div
                                className="dgm-about-btn z-index-1 tp_fade_anim"
                                data-delay=".6"
                                data-duration="1"
                                data-fade-from="top"
                                data-ease="bounce"
                            >
                                <Link
                                    className="tp-btn-circle tp-hover-btn-item tp-hover-btn"
                                    href="/service-details"
                                >
                                    <span>
                                        <TextArrowIconTwo />
                                    </span>
                                    Reach Out
                                    <div className="tp-btn-circle-dot"></div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutFunfact;
