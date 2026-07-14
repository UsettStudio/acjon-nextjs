"use client";
import MenuStyleTwo from "@/components/offcanvus/subComponents/MenuStyleTwo";
import OffCanvasPanelTwo from "@/components/offcanvus/OffCanvasPanelTwo";
import { ArrowIconFive } from "@/svg";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const AboutMeHeader = () => {
    const [openOffcanvas, setOpenOffcanvas] = useState(false);

    return (
        <>
            <header>
                <div className="tp-header-8-area header-transparent tp-header-border">
                    <div className="container container-1510">
                        <div className="row">
                            <div className="col-xl-12">
                                <div className="tp-header-8-wrapper d-flex align-items-center justify-content-between">
                                    <div className="tp-header-14-left">
                                        <div className="tp-header-logo">
                                            <Link href="/">
                                                <Image width={120} height={19} src="/assets/img/logo/logo-yellow.png" alt="header logo" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="tp-header-10-right d-flex align-items-center">
                                        <div className="tp-header-pp-btn-wrap">
                                            <Link className="tp-header-pp-btn" href="/contact-me">lets talk {" "}
                                                <span>
                                                    <ArrowIconFive fillColor="currentColor" />
                                                </span>
                                            </Link>
                                        </div>
                                        <div className="tp-header-pp-bar-wrap ml-25">
                                            <div className="tp-header-bar">
                                                <button onClick={() => setOpenOffcanvas(true)} className="tp-offcanvas-open-btn">
                                                    <i></i>
                                                    <i></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <nav className="tp-mobile-menu-active d-none">
                    <MenuStyleTwo />
                </nav>
            </header>
            {/* off canvas */}
            <OffCanvasPanelTwo
                openOffcanvas={openOffcanvas}
                setOpenOffcanvas={setOpenOffcanvas}
            />
            {/* off canvas */}
        </>
    );
};

export default AboutMeHeader;