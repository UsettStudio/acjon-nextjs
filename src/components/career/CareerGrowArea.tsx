import { ArrowIconFive } from "@/svg";
import Link from "next/link";

const CareerGrowArea = () => {
    return (
        <div className="tp-career-inner-grow-ptb pt-150 pb-160">
            <div className="container">
                <div className="row">
                    <div className="col-xl-8 col-lg-6">
                        <div className="tp-career-inner-grow-heading">
                            <h4 className="tp-section-title fs-42 tl-unbounded fw-600 tt-capitalize mb-20 tp-split-title">
                                Turn Ambition <br /> Into Achievement.
                            </h4>
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-6">
                        <div className="tp-career-inner-grow-wrap">
                            <span className="tp-career-inner-grow-sub tp_fade_anim" data-delay=".3">Join with Creative Team</span>
                            <p className="tp-text-perspective">We push boundaries and think outside the box to create unique,
                                cutting-edge solutions. Every project is an opportunity to explore
                                new ideas and elevate brands.</p>
                            <p className="tp-text-perspective">We push boundaries and think outside the box to create unique,
                                cutting-edge solutions. Every project is an opportunity to explore
                                new ideas and elevate brands.</p>
                            <div className="tp-career-inner-grow-btn tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                <Link href="/team" className="tp-btn-green tp-btn-anim">
                                    <div className="tp-btn-text">Join Our Team </div>
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
    );
};

export default CareerGrowArea;