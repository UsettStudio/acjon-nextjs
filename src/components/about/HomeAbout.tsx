import AnimatedCounterTwo from '../shared/Counter/AnimatedCounterTwo';
import { ButtonArrowIcon } from '@/svg/ArrowIcon';
import Image from 'next/image';
import Link from 'next/link';

const HomeAbout = () => {
    return (
        <div className="tp-about-us-area pt-120 pb-120" style={{ backgroundColor: "#010103" }}>
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="tp-about-us-heading mb-55">
                            <span className="tp-section-subtitle tp-split-title">{`// About Us`}</span>
                            <h3 className="tp-section-title tp-text-revel">
                                The digital world is constantly <br />
                                evolving,  we are at the forefront <br />
                                of shaping its next chapter.
                            </h3>
                        </div>
                    </div>
                    <div className="col-xl-4">
                        <div className="tp-about-us-counter p-relative">
                            <h3 className="tp-about-us-counter-title">
                                <AnimatedCounterTwo min={0} max={10} />+
                            </h3>
                            <span>Years Experience</span>

                            <span className="tp-about-us-shape" data-speed="1.2">
                                <Image width={134} height={130} src="/assets/img/digital-agency/shape/shape-1.png" alt="shape" />
                            </span>
                        </div>
                    </div>
                    <div className="col-xl-8">
                        <div className="row">
                            <div className="col-xl-5 col-lg-4">
                                <div className="tp-about-us-thumb w-100 tp-clip-anim">
                                    <Image width={356} height={433} className="tp-anim-img w-100" data-animate="true"
                                        src="/assets/img/digital-agency/about/about-thumb.jpg" alt="thumb" />
                                </div>
                            </div>
                            <div className="col-xl-7 col-lg-8">
                                <div className="tp-about-us-info">
                                    <div className="tp-about-us-client-wrap d-flex align-items-center mb-50 tp_fade_anim" data-delay=".3">
                                        <div className="tp-about-us-client-avater">
                                            <Image width={144} height={60} src="/assets/img/digital-agency/avater/avater-1.png" alt="avater" />
                                        </div>
                                        <div className="tp-about-us-client-dsc">
                                            <h4>
                                                <AnimatedCounterTwo min={0} max={18} />k
                                            </h4>
                                            <span>customers word.</span>
                                        </div>
                                    </div>
                                    <div className="tp-about-us-client-list mb-45 tp_fade_anim" data-delay=".5">
                                        <ul>
                                            <li><span>the latest trends and technologies.</span></li>
                                            <li><span>Partnering with clients to bring visions.</span></li>
                                            <li><span>blending creativity with technology.</span></li>
                                            <li><span>that exceeds expectations.</span></li>
                                        </ul>
                                    </div>
                                    <div className="tp-about-us-btn tp_fade_anim" data-delay=".7" data-duration="1" data-fade-from="top" data-ease="bounce">
                                        <Link className="tp-btn-green btn-white-bg tp-btn-anim btn-h-60" href="/about-us">
                                            <div className="tp-btn-text">About US</div>
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
            </div>
        </div>
    );
};

export default HomeAbout;