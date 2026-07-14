import { FacebookIconThree, InstragramIconThree, LinkdinIcon, TwitorIconThree } from '@/svg/SocialIcons';
import StartupAFooterCopyright from './subComponents/StartupAFooterCopyright';
import Image from 'next/image';
import Link from 'next/link';

const StartupAgencyFooter = () => {
    return (
        <footer className="sa-footer-ptb pt-110">
            <div className="sa-footer-top-wrap pb-100">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="sa-footer-big-text-warp text-center hover-reveal-item p-relative">
                                <h3 className="sa-footer-big-text tp-split-title">
                                    <Link href="/contact-us">Let&apos;s talk</Link>
                                </h3>
                                <div className="dgm-hero-text-circle sa-footer-text circle-btn-pos">
                                    <Link className="p-relative" href="#">
                                        <span className="dgm-hero-text-shape">
                                            <Image width={116} height={116} src="/assets/img/digital-marketing/shape/hero-text-shape-3.png" alt="hero text shape" />
                                        </span>
                                        <span className="dgm-hero-icon">
                                            <Image width={64} height={64} src="/assets/img/digital-marketing/shape/hero-text-shape-4.png" alt="hero text shape" />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="sa-footer-bottom-warp pt-95 pb-55">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-lg-3 col-sm-6">
                            <div className="ds-footer-widget mb-40 sa-footer-col-1 tp_fade_anim" data-delay=".3">
                                <div className="tp-footer-logo mb-40">
                                    <Link href="/">
                                        <Image width={125} height={20} src="/assets/img/logo/logo-black.png" alt="logo" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="ds-footer-widget mb-40 sa-footer-col-2 tp_fade_anim" data-delay=".4">
                                <div className="tp-footer-widget-info mb-30">
                                    <h4 className="tp-footer-widget-title ff-unbounded fs-18 fw-500 mb-30">Location</h4>
                                    <span>
                                        <Link className="tp-line-black" href="#">
                                            4517 Washington Ave. Manchester, <br />
                                            Kentucky 39495
                                        </Link>
                                    </span>
                                    <div className="ds-footer-social">
                                        <Link href="#"><span>
                                            <FacebookIconThree />
                                        </span></Link>
                                        <Link href="#"><span>
                                            <TwitorIconThree />
                                        </span></Link>
                                        <Link href="#"><span>
                                            <InstragramIconThree />
                                        </span></Link>
                                        <Link href="#"><span>
                                            <LinkdinIcon />
                                        </span></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="ds-footer-widget mb-40 sa-footer-col-3 tp_fade_anim" data-delay=".5">
                                <div className="tp-footer-widget-info mb-30">
                                    <h4 className="tp-footer-widget-title ff-unbounded fs-18 fw-500 mb-30">Get in touch</h4>
                                    <span>
                                        <Link className="tp-line-black" href="mailto:support@gmail.com">support@gmail.com</Link>
                                    </span>
                                    <span className="tel">
                                        <Link className="tp-line-black" href="tel:452(239)555">+452-(239) 555</Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="ds-footer-widget mb-40 sa-footer-col-4 tp_fade_anim" data-delay=".6">
                                <h4 className="tp-footer-widget-title ff-unbounded fs-18 fw-500 mb-50">our newsletter</h4>
                                <div className="ds-footer-widget-input p-relative">
                                    <input type="text" placeholder="Your Email Id" />
                                    <button className="tp-btn-green">Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* copyright area */}
            <StartupAFooterCopyright />
        </footer>
    );
};

export default StartupAgencyFooter;