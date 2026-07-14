import { FacebookIconThree, InstragramIconThree, LinkdinIcon, TwitorIconThree } from '@/svg/SocialIcons';
import LawerAFooterCopyright from './subComponents/LawerAFooterCopyright';
import { ArrowIconFourteen, ArrowIconSeven } from '@/svg/ArrowIcon';
import FooterMenu from './subComponents/FooterMenu';
import Image from 'next/image';
import Link from 'next/link';

const LawyerAgencyFooter = () => {
    return (
        <footer className="tp-footer-9-area include-bg" style={{ backgroundImage: `url(/assets/img/others/footer-9-bg.png)` }}>
            <div className="tp-footer-9-top-wrap pb-70">
                <div className="container container-1510">
                    <div className="tp-footer-9-border">
                        <div className="row align-items-center">
                            <div className="col-lg-9">
                                <div className="tp-footer-9-top-left d-flex align-items-center">
                                    <div className="tp-footer-9-top-thumb">
                                        <Image width={216} height={179} src="/assets/img/others/footer-9-shape.png" alt="shape" />
                                    </div>
                                    <div className="tp-footer-9-top-text">
                                        <h4 className="tp-footer-9-top-title">Contract us today for a <span>free case evaluation?</span></h4>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3">
                                <div className="tp-footer-9-top-right text-lg-end">
                                    <Link className="tp-btn-radius d-inline-flex align-items-center justify-content-between" href="/contact-us">
                                        <span>
                                            <span className="text-1">Contract us</span>
                                            <span className="text-2">Contract us</span>
                                        </span>
                                        <i>
                                            <span>
                                                <ArrowIconSeven />
                                                <ArrowIconSeven />
                                            </span>
                                        </i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tp-footer-9-warp">
                <div className="container container-1510">
                    <div className="tp-footer-9-border pb-30">
                        <div className="row">
                            <div className="col-lg-3 col-md-6 tp_fade_anim" data-delay=".3">
                                <div className="ds-footer-widget tp-footer-9-col-1 mb-40">
                                    <div className="tp-footer-logo mb-40">
                                        <Link href="/">
                                            <Image width={125} height={20} src="/assets/img/logo/logo-brown.png" alt="logo" />
                                        </Link>
                                    </div>
                                    <div className="tp-footer-widget-info mb-50">
                                        <span>
                                            <Link href="#">
                                                4517 Washington Ave. Manchester, <br />
                                                Kentucky 39495
                                            </Link>
                                        </span>
                                    </div>
                                    <div className="ds-footer-social">
                                        <Link href="#"><span><FacebookIconThree /></span></Link>
                                        <Link href="#"><span><TwitorIconThree /></span></Link>
                                        <Link href="#"><span><InstragramIconThree /></span></Link>
                                        <Link href="#"><span><LinkdinIcon /></span></Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 tp_fade_anim" data-delay=".5">
                                <div className="ds-footer-widget tp-footer-9-col-2 mb-40">
                                    <h4 className="tp-footer-widget-title ff-play fs-24 mb-25">quick links</h4>
                                    <div className="tp-footer-widget-menu fs-16">
                                        <FooterMenu
                                            items={[
                                                { label: "Home", href: "#" },
                                                { label: "About Us", href: "#" },
                                                { label: "Services", href: "#" },
                                                { label: "Case Studies", href: "#" },
                                                { label: "Blog", href: "#" },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 tp_fade_anim" data-delay=".7">
                                <div className="ds-footer-widget tp-footer-9-col-3 mb-40">
                                    <h4 className="tp-footer-widget-title ff-play fs-24 mb-25">Services Link</h4>
                                    <div className="tp-footer-widget-menu fs-16">
                                        <FooterMenu
                                            items={[
                                                { label: "Business Consultation", href: "#" },
                                                { label: "Virtual Office Solutions", href: "#" },
                                                { label: "Business Consultation", href: "#" },
                                                { label: "Branding Assistance", href: "#" },
                                                { label: "Video Production", href: "#" },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 tp_fade_anim" data-delay=".9">
                                <div className="ds-footer-widget tp-footer-9-col-4 mb-40">
                                    <h4 className="tp-footer-widget-title ff-play fs-24 mb-25">newsletter</h4>
                                    <div className="ds-footer-widget-input p-relative">
                                        <input type="text" placeholder="Your Email Id" />
                                        <button className="tp-btn-green">Submit {""}
                                            <span>
                                                <ArrowIconFourteen />
                                            </span>
                                        </button>
                                    </div>
                                    <div className="tp-footer-widget-input-remember">
                                        <input id="rem" type="checkbox" />
                                        <label htmlFor="rem">your email is safe with us,</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tp-footer-9-copyright-area">
                <div className="container container-1510">
                    <LawerAFooterCopyright />
                </div>
            </div>
        </footer>
    );
};

export default LawyerAgencyFooter;