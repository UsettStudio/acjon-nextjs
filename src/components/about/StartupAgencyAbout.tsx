import { TextArrowIcon } from '@/svg/ArrowIcon';
import Image from 'next/image';
import Link from 'next/link';

const StartupAgencyAbout = () => {
    return (
        <div className="sa-about-ptb pt-150 pb-150">
            <div className="container container-1630">
                <div className="row">
                    <div className="col-lg-5">
                        <div className="sa-about-title-box p-relative pb-60 tp_fade_anim" data-delay=".3">
                            <span className="tp-section-subtitle st-unbounded st-dot st-border">About Acjon</span>
                            <div className="sa-about-shape">
                                <Image width={159} height={97} data-speed="1.1" src="/assets/img/startup-agancy/about/about-shape.png" alt="about shape" />
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="sa-about-title-box p-relative pb-60 tp_fade_anim" data-delay=".4">
                            <h3 className="tp-section-title fs-42 tl-unbounded fw-500 tp-text-revel">
                                We are a creative Startup <br />
                                Agency that loves making <br />
                                amazing - websites and <br />
                                cool products.
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-5">
                        <div className="sa-about-counter tp_fade_anim" data-delay=".5">
                            <h3 className="sa-about-counter-title purecounter" data-purecounter-duration="1" data-purecounter-end="14">0</h3>
                            <span>Years Of <br />
                                Experiance</span>
                        </div>
                        <div className="sa-about-left d-flex tp_fade_anim" data-delay=".6">
                            <div className="sa-about-left-shape">
                                <Image width={80} height={74} data-speed=".9" src="/assets/img/startup-agancy/about/about-shape-2.png" alt="about shape" />
                            </div>
                            <div className="sa-about-left-thumb">
                                <Image className='img-fluid' width={281} height={190} data-speed="1.1" src="/assets/img/startup-agancy/about/about-thumb-1.jpg" alt="about thumb" />
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="sa-about-right d-flex justify-content-between">
                            <div className="sa-about-right-text">
                                <div className="tp_fade_anim" data-delay=".5">
                                    <p>At Acjon we are more than just a creative agency <br />
                                        we are innovators, storytellers, and digital architects. <br />
                                        Our mission is to craft visually stunning.
                                    </p>
                                </div>
                                <div className="tp_fade_anim" data-delay=".7">
                                    <p>
                                        developers, and strategists, we specialize in creating <br />
                                        unique digital experiences that captivate audiences <br />
                                        drive results.
                                    </p>
                                </div>
                                <div className="sa-about-right-btn tp_fade_anim" data-delay=".9" data-duration="1.2" data-fade-from="top" data-ease="bounce">
                                    <Link className="tp-btn-circle tp-hover-btn-item tp-hover-btn z-index-1" href="/about">
                                        <span>
                                            <TextArrowIcon width='16' height='14' />
                                        </span>
                                        about Us
                                        <div className="tp-btn-circle-dot"></div>
                                    </Link>
                                </div>
                            </div>
                            <div className="sa-about-right-thumb tp-clip-anim" data-speed="1.1">
                                <Image width={390} height={378} className="tp-anim-img" data-animate="true" src="/assets/img/startup-agancy/about/about-thumb-2.jpg" alt="about thumb" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartupAgencyAbout;