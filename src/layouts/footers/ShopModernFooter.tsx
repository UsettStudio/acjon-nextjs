import ShopFooterCopyright from './subComponents/ShopFooterCopyright';
import Image from 'next/image';
import Link from 'next/link';

const ShopModernFooter = () => {
    return (
        <footer style={{ backgroundColor: "#0E0E0E" }}>
            <div className="tp-footer-area pt-120 pb-30">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-xl-3">
                            <div className="tp-footer-widget mb-40 tp_fade_anim" data-delay=".2">
                                <div className="tp-footer-logo">
                                    <Link href="/"><Image width={125} height={19} src="/assets/img/logo/logo-white.png" alt="white logo" /></Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="tp-footer-widget mb-40 tp_fade_anim" data-delay=".3">
                                <h4 className="tp-footer-widget-title mb-35">Main menu</h4>
                                <div className="tp-footer-widget-menu">
                                    <ul>
                                        <li><Link className="tp-hover-line-white border-up" href="#">Home</Link></li>
                                        <li><Link className="tp-hover-line-white border-up" href="#">About Us</Link></li>
                                        <li><Link className="tp-hover-line-white border-up" href="#">Services</Link></li>
                                        <li><Link className="tp-hover-line-white border-up" href="#">Blog</Link></li>
                                        <li><Link className="tp-hover-line-white border-up" href="#">Contact Us</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="tp-footer-widget mb-40 tp_fade_anim" data-delay=".4">
                                <h4 className="tp-footer-widget-title mb-35">Social Media</h4>
                                <div className="tp-footer-widget-social">
                                    <ul>
                                        <li><Link href="#">Facebook</Link></li>
                                        <li><Link href="#">Instagram</Link></li>
                                        <li><Link href="#">LinkedIn</Link></li>
                                        <li> <Link href="#">Twitter</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="tp-footer-widget mb-40 tp_fade_anim" data-delay=".5">
                                <div className="tp-footer-widget-info mb-30">
                                    <h4 className="tp-footer-widget-title mb-25">Get in touch</h4>
                                    <span>
                                        <Link href="mailto:support@gmail.com">support@gmail.com</Link>
                                    </span>
                                    <span>
                                        <Link href="tel:452(239)555010">+452-(239) 555-010</Link>
                                    </span>
                                </div>
                                <div className="tp-footer-widget-info mb-30">
                                    <h4 className="tp-footer-widget-title mb-25">Location</h4>
                                    <span>
                                        <Link href="https://www.google.com/maps" target="_blank">
                                            4517 Washington Ave. Manchester, <br />
                                            Kentucky 39495
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="tp-copyright-area">
                <div className="container container-1510">
                    <ShopFooterCopyright />
                </div>
            </div>
        </footer>
    );
};

export default ShopModernFooter;