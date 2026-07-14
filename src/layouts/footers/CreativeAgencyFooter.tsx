"use client";
import CreativeAFooterCopyright from './subComponents/CreativeAFooterCopyright';
import { text_swiper_params } from '@/constants/swiper';
import FooterMenu from './subComponents/FooterMenu';
import { Swiper, SwiperSlide } from 'swiper/react';
import { TextArrowIcon } from '@/svg/ArrowIcon';
import Image from 'next/image';
import Link from 'next/link';

const CreativeAgencyFooter = () => {
    return (
        <footer className="tp-footer-6-area pt-120" style={{ backgroundColor: "#0D0D0D" }}>
            <div className="tp-footer-6-main-wrap">
                <div className="container container-1410">
                    <div className="row">
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="ds-footer-widget tp-footer-6-col-1 mb-40 tp_fade_anim" data-delay=".3">
                                <div className="tp-footer-6-wrap">
                                    <div className="tp-footer-6-logo mb-35">
                                        <Link href="/">
                                            <Image width={120} height={19} src="/assets/img/logo/logo-white.png" alt="footer logo" />
                                        </Link>
                                    </div>
                                    <div className="tp-footer-6-info">
                                        <span>
                                            <Link className="tp-line-black" href="#">
                                                2118 Thornridge Cir. Syracuse <br /> Connecticut 35624
                                            </Link>
                                        </span>
                                        <span>
                                            <Link className="tp-hover-line-white border-up" href="mailto:Acjon@gmail.com">Acjon@gmail.com</Link>
                                        </span>
                                        <span>
                                            <Link className="tp-hover-line-white border-up" href="tel:01234567">+452-(239) 555-010</Link>
                                        </span>
                                    </div>
                                    <div className="tp-footer-6-btn">
                                        <Link href="/contact">contact Us <span>
                                            <TextArrowIcon />
                                        </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="ds-footer-widget tp-footer-6-col-2 mb-40 tp_fade_anim" data-delay=".4">
                                <h4 className="tp-footer-widget-title ff-unbounded fs-20 fs-500 mb-30">Main menu</h4>
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
                        <div className="col-xl-3 col-lg-4 col-md-6">
                            <div className="ds-footer-widget tp-footer-6-col-3 mb-40 tp_fade_anim" data-delay=".5">
                                <h4 className="tp-footer-widget-title ff-unbounded fs-20 fs-500 mb-30">Social Media</h4>
                                <div className="tp-footer-widget-menu fs-16">
                                    <FooterMenu
                                        items={[
                                            { label: "Facebook", href: "#" },
                                            { label: "Twitter (X)", href: "#" },
                                            { label: "Instagram", href: "#" },
                                            { label: "LinkedIn", href: "#" },
                                            { label: "YouTube", href: "#" },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-6 col-md-6">
                            <div className="ds-footer-widget tp-footer-6-col-4 mb-40 tp_fade_anim" data-delay=".6">
                                <h4 className="tp-footer-widget-title ff-unbounded fs-20 fs-500 mb-30">newsletter</h4>
                                <div className="tp-footer-6-info">
                                    <p>Subscribe our newsletter to get the <br />
                                        latest news and updates.</p>
                                </div>
                                <div className="ds-footer-widget-input tp-footer-6-input p-relative">
                                    <input type="text" placeholder="Your Email Id" />
                                    <button className="tp-footer-6-input-btn">
                                        <span><TextArrowIcon /></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tp-footer-6-bottom">
                <Swiper
                    className='tp-text-slider-active slide-transtion'
                    {...text_swiper_params}
                >
                    {Array(7)
                        .fill("Creative Agency")
                        .map((text, i) => (
                            <SwiperSlide key={i}>
                                <h3 className="tp-footer-6-big-title">{text}</h3>
                            </SwiperSlide>
                        ))}
                </Swiper>
            </div>
            {/* Footer Copyright area */}
            <CreativeAFooterCopyright />
        </footer>
    );
};

export default CreativeAgencyFooter;