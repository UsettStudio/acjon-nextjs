"use client";
import OffCanvasPanel from '@/components/offcanvus/OffCanvasPanel';
import useStickyHeader from '@/hooks/useStickyHeader';
import NavMenus from '../subComponents/NavMenus';
import { MenubarIcon, PhoneIcon } from '@/svg';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BusinessConsultingHeader = () => {
    const [openOffCanvas, setOpenOffCanvas] = useState(false);
    const isSticky = useStickyHeader(20);

    return (
        <>
            <div id="header-sticky" className={`tp-header-area tp-header-ptb tp-header-blur header-transparent
          sticky-pest-bg tp-header-border ${isSticky ? "header-sticky" : ""}`}>
                <div className="container container-1510">
                    <div className="row align-items-center">
                        <div className="col-xl-2 col-lg-6 col-6">
                            <div className="tp-header-logo">
                                <Link href="/">
                                    <Image width={120} height={19} src="/assets/img/logo/logo-white.png" alt="logo white" />
                                </Link>
                            </div>
                        </div>
                        <div className="col-xl-10 col-6">
                            <div className="tp-header-9-main">
                                <div className="tp-header-box">
                                    <div className="tp-header-menu tp-header-dropdown dropdown-pest-bg d-none d-xl-block">
                                        <nav className="tp-mobile-menu-active">
                                            <NavMenus bgClassName='megamenu-pest-bg' />
                                        </nav>
                                    </div>
                                </div>
                                <div className="tp-header-9-right d-flex align-items-center justify-content-end">
                                    <div className="tp-header-7-info mr-15 d-xxl-block d-none">
                                        <Link href="tel:0123456789">
                                            <span>
                                                <PhoneIcon />
                                            </span>{" "}
                                            +(704) 555-0127
                                        </Link>
                                    </div>
                                    <div className="tp-header-14-bar-wrap">
                                        <button onClick={() => setOpenOffCanvas(true)} className="tp-header-8-bar tp-offcanvas-open-btn">
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
            </div>

            {/* Off Canvas Panel */}
            <OffCanvasPanel
                openOffcanvas={openOffCanvas}
                setOpenOffcanvas={setOpenOffCanvas}
            />
        </>
    );
};

export default BusinessConsultingHeader;