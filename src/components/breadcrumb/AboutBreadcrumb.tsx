"use client";
import { BreadcrumbTriangle, ButtonArrowIcon, DropdownArrowIcon } from "@/svg";
import { scrollToSection } from "@/utils/scrollToSection";
import Link from "next/link";

const AboutBreadcrumb = () => {
    return (
        <div className="tp-breadcrumb-s1-ptb position-relative pt-220">
            <span className="tp-breadcrumb-s1-shape-two">
                <svg width="360" height="344" viewBox="0 0 360 344" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M572 58C572 -99.9534 443.953 -228 286 -228C128.047 -228 0 -99.9534 0 58C0 215.953 128.047 344 286 344C443.953 344 572 215.953 572 58ZM82.4468 58C82.4468 -54.4193 173.581 -145.553 286 -145.553C398.419 -145.553 489.553 -54.4193 489.553 58C489.553 170.419 398.419 261.553 286 261.553C173.581 261.553 82.4468 170.419 82.4468 58Z" fill="url(#paint0_linear_2329_1486)" />
                    <defs>
                        <linearGradient id="paint0_linear_2329_1486" x1="134.858" y1="302.779" x2="514.863" y2="-180.333" gradientUnits="userSpaceOnUse">
                            <stop offset="0.015" stopColor="#010103" stopOpacity="0" />
                            <stop offset="1" stopColor="#010103" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                </svg>
            </span>
            <div className="container container-1230">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="tp-breadcrumb-s1-content p-relative pb-120">
                            <div className="tp-breadcrumb-s1-shape">
                                <BreadcrumbTriangle />
                            </div>
                            <h4 className="tp-breadcrumb-s1-title tp_fade_anim" data-delay=".3">Consulting for <br /> the World’s Leading.</h4>
                            <div className="tp-breadcrumb-s1-wrap tp_fade_anim" data-delay=".5">
                                <div className="tp-breadcrumb-s1-subtitle">About Us</div>
                                <div className="tp-breadcrumb-s1-text">
                                    <p>We are a forward-thinking digital creative agency <br />
                                        dedicated to crafting impactful brand.</p>
                                    <div className="tp-breadcrumb-s1-btn mt-50 tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                        <Link href="/about" className="tp-btn-green btn-black-bg tp-btn-anim">
                                            <div className="tp-btn-text">Explore More</div>
                                            <span>
                                                <ButtonArrowIcon />
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tp-breadcrumb-s1-bottom">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="tp-breadcrumb-s1-bottom-text">
                                <p className="smooth"><Link
                                    onClick={(e) =>
                                        scrollToSection(e, {
                                            target: "#b",
                                            duration: 1,
                                        })
                                    }
                                    href="#b">scroll to explore <span>
                                        <DropdownArrowIcon />
                                    </span></Link>
                                </p>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="tp-breadcrumb-s1-bottom-text text-md-end">
                                <p>Our Short Story</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutBreadcrumb;