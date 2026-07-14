"use client";
import MenuStyleTwo from '@/components/offcanvus/subComponents/MenuStyleTwo';
import OffCanvasPanelTwo from '@/components/offcanvus/OffCanvasPanelTwo';
import { BarIconTwo } from '@/svg/BarIcons';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PortfolioWebglHeader = () => {
    const [openOffcanvas, setOpenOffcanvas] = useState(false);
    return (
        <>
            <header>
                <div className="tp-header-8-area header-transparent">
                    <div className="container container-1800">
                        <div className="row">
                            <div className="col-xl-12">
                                <div className="tp-header-8-wrapper d-flex align-items-center justify-content-between">
                                    <div className="tp-header-14-left">
                                        <div className="tp-header-logo">
                                            <Link href="/">
                                                <Image width={120} height={19} src="/assets/img/logo/logo-white.png" alt="" /></Link>
                                        </div>
                                    </div>
                                    <div className="tp-header-14-right d-flex align-items-center">
                                        <div className="tp-header-8-info d-none d-md-block">
                                            <Link className="tp-line-white" href="mailto:hello@agntix.com">hello@acjon.com</Link>
                                        </div>
                                        <div className="tp-header-14-bar-wrap ml-20">
                                            <button onClick={() => setOpenOffcanvas(true)} className="tp-header-8-bar tp-offcanvas-open-btn">
                                                <span>Menu</span>
                                                <span>
                                                    <BarIconTwo />
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
                    <ul>
                        <MenuStyleTwo />
                    </ul>
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

export default PortfolioWebglHeader;