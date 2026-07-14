"use client";
import { BreadcrumbTriangle, DropdownArrowIcon } from "@/svg";
import { scrollToSection } from "@/utils/scrollToSection";
import Image from "next/image";
import Link from "next/link";

const ServiceBreadcrumb = () => {
    return (
        <div className="tp-breadcrumb-s1-ptb tp-breadcrumb-s5-ptb position-relative">
            <span className="tp-breadcrumb-s1-shape-two d-none d-lg-block">
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
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="tp-breadcrumb-s1-content p-relative pb-80">
                            <div className="tp-breadcrumb-s1-shape" data-speed=".9">
                                <BreadcrumbTriangle />
                            </div>
                            <h4 className="tp-breadcrumb-s5-title tp-char-animation">Explore Our <br />
                                <Image className="img-fluid w-auto h-auto" width={201} height={86} data-delay=".3" src="/assets/img/inner-image/service/man.png" alt="author" /> Real Services</h4>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tp-breadcrumb-s1-bottom">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="tp-breadcrumb-s1-bottom-text">
                                <p className="smooth">
                                    <Link href="#b" onClick={(e) =>
                                        scrollToSection(e, {
                                            target: "#b",
                                            duration: 1,
                                        })
                                    }>scroll to explore <span>
                                            <DropdownArrowIcon />
                                        </span>
                                    </Link>
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

export default ServiceBreadcrumb;