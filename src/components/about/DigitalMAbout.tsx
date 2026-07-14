import { ArrowIconTwo, CroseIconTwo } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const DigitalMarketingAbout = () => {
    return (
        <div className="dgm-about-ptb fix pt-120 pb-120">
            <div className="dgm-about-wrapper p-relative">
                <div className="dgm-about-thumb-left tp-clip-anim">
                    <Image width={540} height={410} className="tp-anim-img" data-animate="true" src="/assets/img/digital-marketing/about/about-2.jpg" alt="about image" />
                </div>
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-xl-3">
                            <div className="dgm-about-subtitle-box tp_fade_anim" data-delay=".3">
                                <span className="tp-section-subtitle fs-13 st-unbounded st-dot st-border">Our About</span>
                            </div>
                        </div>
                        <div className="col-xl-9">
                            <div className="dgm-about-bottom">
                                <div className="row">
                                    <div className="col-xl-7 col-lg-6">
                                        <div className="dgm-about-title-box mb-80 tp_fade_anim" data-delay=".4">
                                            <h4 className="tp-section-title tl-unbounded fs-42 tp-text-revel">
                                                Crafting Digital <br /> Experiences
                                                <span>That The <br /> Inspire</span>
                                                & Transform Turning Ideas
                                            </h4>
                                        </div>
                                        <div className="dgm-about-content">
                                            <div className="tp_fade_anim" data-delay=".5">
                                                <p className="mb-25">
                                                    we don&apos;t just create designs—we craft experiences that leave
                                                    a lasting impact. Our team of passionate designers, strategists,
                                                    and innovators work together
                                                </p>
                                            </div>
                                            <div className="tp_fade_anim" data-delay=".5">
                                                <p className="mb-50">
                                                    to push the boundaries of creativity and technology. From <br />
                                                    branding to UI/UX, web design
                                                </p>
                                            </div>
                                        </div>
                                        <div className="dgm-about-btn pb-65 tp_fade_anim" data-delay=".9" data-duration="1.2" data-fade-from="top" data-ease="bounce">
                                            <Link className="tp-btn-circle tp-hover-btn-item tp-hover-btn" href="/about">
                                                <span><ArrowIconTwo width='16' height='16' /></span>
                                                about Us
                                                <div className="tp-btn-circle-dot"></div>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-xl-5 col-lg-6">
                                        <div className="dgm-about-info-wrap">
                                            <div className="dgm-about-thumb">
                                                <Image width={100} height={61} className="mb-60" src="/assets/img/digital-marketing/shape/ab-shape-1.png" alt="about image" />
                                                <div className="p-relative">
                                                    <Image width={291} height={336} className="anim-zoomin img-fluid w-100 h-100" src="/assets/img/digital-marketing/about/about-1.jpg" alt="about image" />
                                                    <Image width={102} height={103} className="dgm-about-thumb-shape" src="/assets/img/digital-marketing/shape/ab-shape-2.png" alt="shape" />
                                                </div>
                                            </div>
                                            <div className="dgm-about-info-item" data-speed="1.1">
                                                <div className="dgm-about-info-icon">
                                                    <Image width={26} height={18} src="/assets/img/digital-marketing/icon/icon.png" alt="icon" />
                                                </div>
                                                <p>
                                                    Make Your Business prosper
                                                    with our Great Team of Experts.
                                                    {`we'll`} Make Your.
                                                </p>
                                                <span>
                                                    <em>14</em>
                                                    <i><CroseIconTwo /></i>
                                                </span>
                                            </div>
                                        </div>
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

export default DigitalMarketingAbout;