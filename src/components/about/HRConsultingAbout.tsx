import { ShapeTitleLine } from '@/svg/ShapeIcons';
import { ArrowIconSeven } from '@/svg/ArrowIcon';
import Image from 'next/image';
import Link from 'next/link';

const HRConsultingAbout = () => {
    return (
        <div className="hr-about-ptb hr-spacing-plr pt-120 pb-120 z-index-1" style={{ backgroundColor: "#fff" }}>
            <div className="row">
                <div className="col-xxl-5 col-lg-6">
                    <div className="hr-about-thumb fix tp-clip-anim">
                        <Image width={644} height={586} className="w-100 tp-anim-img" data-animate="true" data-speed=".8"
                            src="/assets/img/hr-consulting/about/about-1.jpg" alt="about image" />
                    </div>
                </div>
                <div className="col-xxl-7">
                    <div className="hr-about-right">
                        <div className="row align-items-end">
                            <div className="col-lg-8">
                                <div className="hr-about-content-wrap">
                                    <div className="hr-about-title-box">
                                        <span className="tp-section-subtitle st-dot st-border tp_fade_anim" data-delay=".3">
                                            Who we are
                                        </span>
                                        <h4 className="tp-section-title tl-spacegro text-case-int tp-split-title">
                                            Shaping the future <br /> with
                                            <span className="p-relative">
                                                Creativity.
                                                <ShapeTitleLine />
                                            </span>
                                        </h4>
                                    </div>
                                    <div className="hr-about-content tp_fade_anim" data-delay=".5">
                                        <p className="mb-30">
                                            Our dedication to quality over quantity has earned
                                            the trust of clients who value precision, authenticity.
                                            excellence. Our dedication.
                                        </p>
                                        <p className="mb-40">
                                            earned us the trust of clients who value precision. Our dedication to quality over quantity has earned
                                            us the trust of clients who value precision.
                                        </p>
                                    </div>
                                    <div className="tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                        <Link href="/about" className="tp-btn-green btn-h-60 br-8 tp-btn-anim">
                                            <div className="tp-btn-text">Read more</div>
                                            <span>
                                                <ArrowIconSeven />
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="hr-about-funfact-wrap tp_fade_anim" data-delay=".5">
                                    <div className="hr-about-funfact">
                                        <i></i>
                                        <span>Years Of Experience</span>
                                        <h4>20</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRConsultingAbout;