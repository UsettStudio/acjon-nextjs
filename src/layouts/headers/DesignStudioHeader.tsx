"use client";
import MenuStyleTwo from '@/components/offcanvus/subComponents/MenuStyleTwo';
import OffCanvasPanelTwo from '@/components/offcanvus/OffCanvasPanelTwo';
import useStickyHeader from '@/hooks/useStickyHeader';
import { MenubarIcon } from '@/svg';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const DesignStudioHeader = ({ containerPaddingSpacing = "container-1510", zIndexOpacity = "" }: { containerPaddingSpacing?: string, zIndexOpacity?: string }) => {
    const [openOffcanvas, setOpenOffcanvas] = useState(false);
    const isSticky = useStickyHeader(20);

    return (
        <>
            <header>
                <div id="header-sticky"
                    className={`tp-header-8-area header-transparent ${zIndexOpacity} tp-header-blur sticky-white-bg ${isSticky ? "header-sticky" : ""}`}>
                    <div className={`container ${containerPaddingSpacing}`}>
                        <div className="row">
                            <div className="col-xl-12">
                                <div className="tp-header-8-wrapper d-flex align-items-center justify-content-between">
                                    <div className="tp-header-14-left">
                                        <div className="tp-header-logo">
                                            <Link href="/">
                                                <Image width={150} height={103} style={{ width: "150px", height: "auto" }} className="logo-white" src="/assets/img/logo/logo-white-v2.png" alt="Usett logo" />
                                                <Image width={150} height={103} style={{ width: "150px", height: "auto" }} className="logo-black" src="/assets/img/logo/logo-black-v2.png" alt="Usett logo" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="tp-header-14-right d-flex align-items-center">
                                        <div className="tp-header-14-bar-wrap ml-20">
                                            <button onClick={() => setOpenOffcanvas(true)} className="tp-header-8-bar tp-offcanvas-open-btn">
                                                <span>Meny</span>{" "}
                                                <span>
                                                    <MenubarIcon />
                                                </span>
                                            </button>
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

export default DesignStudioHeader;