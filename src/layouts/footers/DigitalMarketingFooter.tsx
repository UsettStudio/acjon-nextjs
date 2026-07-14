import DigitalMFooterContactInfo from './subComponents/DigitalMFooterContactInfo';
import DigitalMFooterCopyright from './subComponents/DigitalMFooterCopyright';
import FooterMenu from './subComponents/FooterMenu';
import Link from 'next/link';

// Menu data
const menuData = [
    { id: 1, label: "Home", link: "/" },
    { id: 2, label: "Portfolio", link: "/project-two-colum" },
    { id: 3, label: "Blog", link: "/blog" },
    { id: 4, label: "Contact", link: "/contact-us" },
];

const DigitalMarketingFooter = () => {
    return (
        <footer className="tp-footer-3-area pt-110" style={{ backgroundColor: "#010103" }}>
            <div className="tp-footer-3-top-wrap pb-100">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="tp-footer-3-top-menu">
                                <ul>
                                    {menuData.map((item) => (
                                        <li key={item.id} className="hover-reveal-item p-relative">
                                            <Link href={item.link}>{item.label}</Link>
                                            <span className="circle-btn-pos">New Page</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tp-footer-3-bottom-wrap pt-95 pb-55">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-lg-3 col-md-6">
                            <DigitalMFooterContactInfo />
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="tp-footer-widget mb-40 tp-footer-3-col-2 tp_fade_anim" data-delay=".4">
                                <h4 className="tp-footer-widget-title ff-unbounded fs-16 fw-500 mb-30">quick links</h4>
                                <div className="tp-footer-widget-menu fs-16">
                                    <ul>
                                        <FooterMenu
                                            items={[
                                                { label: "Home", href: "#" },
                                                { label: "About Us", href: "#" },
                                                { label: "Services", href: "#" },
                                                { label: "Case Studies", href: "#" },
                                                { label: "Blog", href: "#" },
                                            ]}
                                        />
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="tp-footer-widget mb-40 tp-footer-3-col-3 tp_fade_anim" data-delay=".5">
                                <h4 className="tp-footer-widget-title ff-unbounded fs-16 fw-500 mb-30">Support</h4>
                                <div className="tp-footer-widget-menu fs-16">
                                    <FooterMenu
                                        items={[
                                            { label: "Help Centre", href: "#" },
                                            { label: "Privacy policy", href: "#" },
                                            { label: "FAQ", href: "#" },
                                            { label: "Community", href: "#" },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="tp-footer-widget mb-40 tp-footer-3-col-4 tp_fade_anim" data-delay=".6">
                                <h4 className="tp-footer-widget-title ff-unbounded fs-16 fw-500 mb-40">Join our newsletter</h4>
                                <div className="tp-footer-widget-input p-relative">
                                    <input type="text" placeholder="Your Email Id" />
                                    <div className="tp-footer-widget-input-remember">
                                        <input id="reme" type="checkbox" />
                                        <label htmlFor="reme">your email is safe with us, we {`don't`} spam</label>
                                    </div>
                                    <button className="tp-btn-green tp-btn-anim input-hover">
                                        <span className="tp-btn-text"> Submit Now </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tp-footer-3-copyright-area">
                <div className="container container-1510">
                    <DigitalMFooterCopyright />
                </div>
            </div>
        </footer>
    );
};

export default DigitalMarketingFooter;