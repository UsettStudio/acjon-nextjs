import footerBgImg from '../../../public/assets/img/others/footer-8-bg.png';
import HRCFooterCopyright from './subComponents/HRCFooterCopyright';
import { ArrowIconTwelve, NotificationIcon } from '@/svg';
import FooterMenu from './subComponents/FooterMenu';
import { PhoneIconThree } from '@/svg/PhoneIcons';
import Image from 'next/image';
import Link from 'next/link';

const HRConsultingFooter = () => {
    return (
        <div className="tp-footer-8-area include-bg pt-100"
            style={{ backgroundColor: "#093535", backgroundImage: `url(${footerBgImg.src})` }}>
            <div className="ds-footer-bottom-warp pb-50">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="ds-footer-widget tp-footer-4-col-1 mb-40 tp_fade_anim" data-delay=".3">
                                <div className="tp-footer-logo mb-30">
                                    <Link href="/">
                                        <Image width={125} height={20} src="/assets/img/logo/logo-white.png" alt="logo white" />
                                    </Link>
                                </div>
                                <div className="tp-footer-widget-info mb-50">
                                    <span>
                                        <Link href="#">
                                            We are a dynamic and innovative agency
                                            committed to delivering cutting.
                                        </Link>
                                    </span>
                                </div>
                                <div className="tp-footer-8-info">
                                    <Link href="tel:012345678">
                                        <span>
                                            <PhoneIconThree />
                                        </span>
                                        +123 (406) 555-0120
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="ds-footer-widget tp-footer-4-col-2 mb-40 tp_fade_anim" data-delay=".5">
                                <h4 className="tp-footer-widget-title ff-space fs-24 mb-25">Our Services</h4>
                                <div className="tp-footer-widget-menu fs-16">
                                    <FooterMenu
                                        items={[
                                            { label: "Digital Marketing", href: "#" },
                                            { label: "Brand Strategy", href: "#" },
                                            { label: "Business Consulting", href: "#" },
                                            { label: "Creative Advertising", href: "#" },
                                            { label: "Content Marketing", href: "#" },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="ds-footer-widget tp-footer-4-col-3 mb-40 tp_fade_anim" data-delay=".7">
                                <h4 className="tp-footer-widget-title ff-space fs-24 mb-25">Other Services</h4>
                                <div className="tp-footer-widget-menu fs-16">
                                    <FooterMenu
                                        items={[
                                            { label: "Email Marketing", href: "#" },
                                            { label: "App Development", href: "#" },
                                            { label: "Influencer Marketing", href: "#" },
                                            { label: "Automation Solutions", href: "#" },
                                            { label: "Video Production", href: "#" },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="ds-footer-widget tp-footer-4-col-4 mb-40 tp_fade_anim" data-delay=".9">
                                <h4 className="tp-footer-widget-title ff-space fs-24 mb-25">Subscribe Newsletter</h4>
                                <div className="tp-footer-8-input">
                                    <div className="tp-footer-8-input-notifi">
                                        <p><span><NotificationIcon /></span>
                                            Please sign up for notify any updates
                                        </p>
                                    </div>
                                    <div className="ds-footer-widget-input p-relative">
                                        <input type="text" placeholder="Your Email Id" />
                                        <button>
                                            <ArrowIconTwelve />
                                        </button>
                                    </div>
                                    <div className="tp-footer-8-input-text">
                                        <p>Don&apos;s miss the latest news</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ds-copyright-area">
                <div className="container container-1510">
                    <HRCFooterCopyright />
                </div>
            </div>
        </div>
    );
};

export default HRConsultingFooter;