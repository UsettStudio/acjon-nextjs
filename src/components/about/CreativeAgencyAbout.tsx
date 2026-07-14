import AnimatedCounterTwo from '../shared/Counter/AnimatedCounterTwo';
import { CouterShape } from '@/svg/ShapeIcons';
import { ButtonArrowIcon } from '@/svg';
import Link from 'next/link';

const CreativeAgencyAbout = () => {
    return (
        <div className="ca-about-ptb pt-120 pb-115">
            <div className="container">
                <div className="row align-items-end">
                    <div className="col-lg-8">
                        <div className="ca-about-text-box">
                            <h3 className="tp-section-title tl-unbounded title-white mb-150 tp-text-revel tp_fade_anim" data-delay=".3">We are the ones who <br /> create the future</h3>
                            <div className="ca-about-counter-box p-relative tp_fade_anim" data-delay=".4">
                                <div className="ca-about-counter-shape" data-speed="1.1">
                                    <CouterShape />
                                </div>
                                <h3 className="ca-about-counter-title">
                                    <AnimatedCounterTwo min={0} max={10}/>+
                                </h3>
                                <span>Years Of Experience</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="ca-about-text-right-box">
                            <div className="ca-about-text mb-45">
                                <div className="tp_fade_anim" data-delay=".3">
                                    <p>
                                        Our dedication to quality over quantity has earned us <br />
                                        the trust of clients who value precision, authenticity, <br />
                                        and excellence.
                                    </p>
                                </div>
                                <div className="tp_fade_anim" data-delay=".5">
                                    <p>
                                        We believe that a single masterpiece can speak louder <br />
                                        than a hundred mediocre efforts.
                                    </p>
                                </div>
                            </div>
                            <div className="ca-about-text-btn tp_fade_anim" data-delay=".7" data-fade-from="top" data-duration="1.2" data-ease="bounce">
                                <Link className="tp-btn-green tp-btn-anim btn-white-bg" href="/about-us">
                                    <div className="tp-btn-text">
                                        About Us
                                    </div>
                                    <span>
                                        <ButtonArrowIcon />
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

export default CreativeAgencyAbout;