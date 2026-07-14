import HomeFooterContactInfo from "./subComponents/HomeFooterContactInfo";
import HomeFooterCopyright from "./subComponents/HomeFooterCopyright";
import CopyrightSliderPart from "./subComponents/CopyrightSliderPart";
import FooterMenu from "./subComponents/FooterMenu";
import Image from "next/image";
import Link from "next/link";

const HomeFooter = () => {
    return (
        <footer style={{ backgroundColor: "#0E0E0E" }}>
            <div className="tp-footer-area pt-120 pb-30">
                <div className="container container-1510">
                    <div className="row">
                        {/* Logo */}
                        <div className="col-xl-3">
                            <div className="tp-footer-widget mb-40 tp_fade_anim" data-delay=".2">
                                <div className="tp-footer-logo">
                                    <Link href="/">
                                        <Image width={125} height={20} src="/assets/img/logo/logo-white.png" alt="logo white" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Main menu */}
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="tp-footer-widget mb-40 tp_fade_anim">
                                <h4 className="tp-footer-widget-title mb-35">Main menu</h4>
                                <div className="tp-footer-widget-menu">
                                    <FooterMenu
                                        items={[
                                            { label: "Home", href: "#" },
                                            { label: "About Us", href: "#" },
                                            { label: "Services", href: "#" },
                                            { label: "Blog", href: "#" },
                                            { label: "Contact Us", href: "#" },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="tp-footer-widget mb-40 tp_fade_anim" data-delay=".4">
                                <h4 className="tp-footer-widget-title mb-35">Social Media</h4>
                                <div className="tp-footer-widget-social">
                                    <ul>
                                        <li><Link href="#">Facebook</Link></li>
                                        <li><Link href="#">Instagram</Link></li>
                                        <li><Link href="#">LinkedIn</Link></li>
                                        <li><Link href="#">Twitter</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/* Contact Info*/}
                        <HomeFooterContactInfo />
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="tp-copyright-area" >
                <HomeFooterCopyright />

                {/* Slider part kept same */}
                <CopyrightSliderPart />
            </div>
        </footer >
    );
};

export default HomeFooter;
