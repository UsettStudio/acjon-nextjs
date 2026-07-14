import CorporateAFooterCopyright from './subComponents/CorporateAFooterCopyright';
import { InstragramIcon, LinkdinIcon, TwitorIconThree } from '@/svg/SocialIcons';
import FooterMenu from './subComponents/FooterMenu';
import { FacebookIcon } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const CorporateAFooter = () => {
    return (
        <footer className="tp-footer-4-area pt-120" style={{ backgroundColor: "#093535", backgroundImage: `url(/assets/img/others/footer-4-bg.png)` }}>
            <div className="ds-footer-bottom-warp pb-80">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-lg-3 col-md-6">
                            <div className="ds-footer-widget tp-footer-4-col-1 mb-40 tp_fade_anim" data-delay=".3">
                                <div className="tp-footer-logo mb-40">
                                    <Link href="/">
                                        <Image width={125} height={20} src="/assets/img/logo/logo-white.png" alt="logo white" />
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
                                    <Link href="#"><span>
                                        <FacebookIcon />
                                    </span></Link>
                                    <Link href="#"><span>
                                        <TwitorIconThree />
                                    </span></Link>
                                    <Link href="#"><span>
                                        <InstragramIcon />
                                    </span></Link>
                                    <Link href="#"><span>
                                        <LinkdinIcon />
                                    </span></Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="ds-footer-widget tp-footer-4-col-2 mb-40 tp_fade_anim" data-delay=".5">
                                <h4 className="tp-footer-widget-title ff-space fs-24 mb-25">quick links</h4>
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
                        <div className="col-lg-3 col-md-6">
                            <div className="ds-footer-widget tp-footer-4-col-3 mb-40 tp_fade_anim" data-delay=".7">
                                <h4 className="tp-footer-widget-title ff-space fs-24 mb-25">Services Link</h4>
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
                        <div className="col-lg-3 col-md-6">
                            <div className="ds-footer-widget tp-footer-4-col-4 mb-40 tp_fade_anim" data-delay=".9">
                                <h4 className="tp-footer-widget-title ff-space fs-24 mb-25">newsletter</h4>
                                <div className="ds-footer-widget-input p-relative">
                                    <input type="text" placeholder="Your Email Id" />
                                    <button className="tp-btn-green">Submit Now</button>
                                </div>
                                <div className="tp-footer-widget-input-remember">
                                    <input id="remembers" type="checkbox" />
                                    <label htmlFor="remembers">your email is safe with us, we {`don't`} spam</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ds-copyright-area">
                <div className="container container-1510">
                    <CorporateAFooterCopyright />
                </div>
            </div>
        </footer>
    );
};

export default CorporateAFooter;