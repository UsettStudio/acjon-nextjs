import BusinessCFooterCopyright from './subComponents/BusinessCFooterCopyright';
import ImageHoverRevealProvider from '@/provider/ImageHoverRevealProvider';
import FooterMenu from './subComponents/FooterMenu';
import Image from 'next/image';
import Link from 'next/link';

const BusinessConsultingFooter = () => {
    return (
        <footer className="tp-footer-5-area pt-120" style={{ backgroundColor: "#093535" }}>
            <div className="tp-footer-5-main-warp pb-40">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-xxl-3 col-lg-4 col-md-6 tp_fade_anim" data-delay=".3">
                            <div className="ds-footer-widget tp-footer-5-col-1 mb-40">
                                <div className="tp-footer-5-wrap" style={{ backgroundImage: `url(/assets/img/others/footer-5-shape.png)` }}>
                                    <div className="tp-footer-5-logo mb-35">
                                        <Link href="/">
                                            <Image width={125} height={20} src="/assets/img/logo/logo-black.png" alt="logo black" />
                                        </Link>
                                    </div>
                                    <div className="tp-footer-5-info">
                                        <span>
                                            <Link className="tp-line-black" href="#">
                                                4517 Washington Ave. Manchester, <br />
                                                Kentucky 39495
                                            </Link>
                                        </span>
                                        <p>
                                            Mail :
                                            <Link className="tp-line-white" href="mailto:support@gmail.com"> support@gmail.com</Link>
                                        </p>{" "}
                                        <p>
                                            Ph :
                                            <Link className="tp-line-white" href="tel:012345678"> +452-(239) 555-010</Link>
                                        </p>
                                    </div>
                                    <div className="tp-footer-5-social">
                                        <Link href="#">FB.</Link>{" "}
                                        <Link href="#">TW.</Link>{" "}
                                        <Link href="#">LN.</Link>{" "}
                                        <Link href="#">YT.</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-3 col-lg-4 col-md-6 tp_fade_anim" data-delay=".5">
                            <div className="ds-footer-widget tp-footer-5-col-2 mb-40">
                                <h4 className="tp-footer-widget-title fs-24 mb-25">quick links</h4>
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
                        <div className="col-xxl-3 col-lg-4 col-md-6 tp_fade_anim" data-delay=".7">
                            <div className="ds-footer-widget tp-footer-5-col-3 mb-40">
                                <h4 className="tp-footer-widget-title fs-24 mb-25">Services Link</h4>
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
                        <div className="col-xxl-3 col-lg-4 col-md-6 tp_fade_anim" data-delay=".9">
                            <div className="ds-footer-widget tp-footer-5-col-4 mb-40">
                                <h4 className="tp-footer-widget-title fs-24 mb-25">newsletter</h4>
                                <div className="ds-footer-widget-input p-relative">
                                    <input type="text" placeholder="Your Email Id" />
                                    <button className="tp-btn-green">Submit</button>
                                </div>
                                <div className="tp-footer-widget-input-remember">
                                    <input id="remembe" type="checkbox" />
                                    <label htmlFor="remembe">By subscribing, you accept our <Link href="#">Privacy Policy</Link></label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ImageHoverRevealProvider>
                <div className="tp-footer-5-text-big pb-50">
                    <div className="container container-1510">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="tp-footer-5-text-title hover-reveal-item p-relative">
                                    <Link href="/contact-us"><Image className='img-fluid w-auto h-auto' width={1482} height={161} src="/assets/img/others/footer-5-text-big.png" alt="shape" /></Link>
                                    <div className="tp-footer-5-btn circle-btn-pos">
                                        <Image width={100} height={100} src="/assets/img/others/footer-5-text-shaple.png" alt="text shape" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ImageHoverRevealProvider>
            <div className="ds-copyright-area">
                <div className="container container-1510">
                    <BusinessCFooterCopyright />
                </div>
            </div>
        </footer>
    );
};

export default BusinessConsultingFooter;