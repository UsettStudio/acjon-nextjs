"use client";
import OffCanvasPanel from '@/components/offcanvus/OffCanvasPanel';
import useStickyHeader from '@/hooks/useStickyHeader';
import NavMenus from '../subComponents/NavMenus';
import { MenubarIcon } from '@/svg';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const StartupAgencyHeader = () => {
    const [openOffCanvas, setOpenOffCanvas] = useState(false);
    const isSticky = useStickyHeader(20);

    return (
        <>
            <div id="header-sticky" className={`tp-header-area tp-header-ptb tp-header-blur ${isSticky ? 'header-sticky' : ''}
         sticky-white-bg header-transparent`}>
                <div className="container container-1510">
                    <div className="row align-items-center">
                        <div className="col-xl-2 col-lg-6 col-6">
                            <div className="tp-header-logo">
                                <Link href="/">
                                    <Image width={120} height={19} src="/assets/img/logo/logo-black.png" alt="logo black" />
                                </Link>
                            </div>
                        </div>
                        <div className="col-xl-7 d-none d-xl-block">
                            <div className="tp-header-box text-center">
                                <div className="tp-header-menu tp-header-5-menu tp-header-dropdown dropdown-white-bg">
                                    <nav className="tp-mobile-menu-active">
                                        <NavMenus />
                                    </nav>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-6 col-6">
                            <div className="tp-header-right d-flex align-items-center justify-content-end">
                                <div className="tp-header-14-bar-wrap">
                                    <button onClick={() => setOpenOffCanvas(true)} className="tp-header-8-bar bar-black-style tp-offcanvas-open-btn">
                                        <span>Menu</span>{" "}
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

            {/* Off Canvas Panel */}
            <OffCanvasPanel
                openOffcanvas={openOffCanvas}
                setOpenOffcanvas={setOpenOffCanvas}
            />
        </>
    );
};

export default StartupAgencyHeader;