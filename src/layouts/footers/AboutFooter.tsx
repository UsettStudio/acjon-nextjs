import AboutFooterCopyright from "./subComponents/AboutFooterCopyright";
import FooterMenu from "./subComponents/FooterMenu";
import { TextArrowIcon } from "@/svg/ArrowIcon";
import Image from "next/image";
import Link from "next/link";

const AboutFooter = () => {
    return (
        <footer className="tp-footer-7-area pt-110" style={{ backgroundColor: "#010103" }}>
            <div className="tp-footer-7-main-wrap pb-80">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-lg-3 col-md-6">
                            <div className="tp-footer-widget mb-40 tp-footer-3-col-1 tp_fade_anim" data-delay=".3">
                                <div className="tp-footer-widget-info mb-30">
                                    <h4 className="tp-footer-widget-title ff-unbounded fs-20 fw-500 mb-30">Address</h4>
                                    <span>
                                        <Link className="tp-line-black" href="#">
                                            4517 Washington Ave. Manchester, <br />
                                            Kentucky 39495
                                        </Link>
                                    </span>
                                    <p>
                                        Mail :
                                        <Link className="tp-line-white" href="mailto:support@gmail.com">support@gmail.com</Link>
                                    </p>
                                    <p>
                                        Ph :
                                        <Link className="tp-line-white" href="tel:012345678">+452-(239) 555-010</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="tp-footer-widget mb-40 tp-footer-3-col-2 tp_fade_anim" data-delay=".5">
                                <h4 className="tp-footer-widget-title ff-unbounded fs-20 fw-500 mb-30">quick links</h4>
                                <div className="tp-footer-widget-menu">
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
                        <div className="col-lg-3 col-md-6">
                            <div className="tp-footer-widget mb-40 tp-footer-3-col-3 tp_fade_anim" data-delay=".7">
                                <h4 className="tp-footer-widget-title ff-unbounded fs-20 fw-500 mb-30">Support</h4>
                                <div className="tp-footer-widget-menu">
                                    <FooterMenu
                                        items={[
                                            { label: "Help Centre", href: "#" },
                                            { label: "Privacy policy", href: "#" },
                                            { label: "FAQ", href: "#" },
                                            { label: "Branding Assistance", href: "#" },
                                            { label: "Community", href: "#" },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="tp-footer-widget mb-40 tp-footer-3-col-4 tp_fade_anim" data-delay=".9">
                                <h4 className="tp-footer-widget-title ff-unbounded fs-20 fw-500 mb-40">Join our newsletter</h4>
                                <div className="tp-footer-widget-input p-relative">
                                    <input type="text" placeholder="Your Email Id" />
                                    <div className="tp-footer-widget-input-remember">
                                        <input id="remember" type="checkbox" />
                                        <label htmlFor="remember">your email is safe with us, we {`don't`} spam</label>
                                    </div>
                                    <button className="tp-btn-green input-hover">Submit Now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tp-footer-7-bottom-wrap">
                <div className="container container-1510">
                    <div className="tp-footer-7-bottom">
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <div className="tp-footer-7-logo mb-40">
                                    <Link href="/">
                                        <Image className="img-fluid" width={782} height={118} src="/assets/img/others/footer-7-logo.png" alt="footer logo" />
                                    </Link>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="ds-footer-btn z-index-1 text-md-end mb-40 tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                    <Link className="tp-btn-circle shadow-circle" href="/contact-us">
                                        <span>
                                            <TextArrowIcon />
                                        </span>
                                        let&apos;s talk
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* copyright area */}
            <AboutFooterCopyright />
        </footer>
    );
};

export default AboutFooter;