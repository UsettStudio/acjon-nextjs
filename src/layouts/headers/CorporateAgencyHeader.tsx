"use client";
import OffCanvasPanel from '@/components/offcanvus/OffCanvasPanel';
import useStickyHeader from '@/hooks/useStickyHeader';
import { ArrowIconFive, PhoneIcon } from '@/svg';
import NavMenus from '../subComponents/NavMenus';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CorporateAgencyHeader = ({ bgClassName }: { bgClassName: string }) => {
    const [openOffCanvas, setOpenOffCanvas] = useState(false);
    const isSticky = useStickyHeader(20);

    return (
        <>
            <div className="tp-header-area tp-header-ptb tp-header-blur header-transparent">
                <div className="container container-1510">
                    <div className="tp-header-7-top d-none d-xl-block">
                        <div className="row">
                            <div className="col-lg-4">
                                <div className="tp-header-7-top-text">
                                    <p>Welcome to our acjon serving the up sate</p>
                                </div>
                            </div>
                            <div className="col-lg-8">
                                <div className="tp-header-7-top-text d-flex justify-content-lg-end">
                                    <p className="mr-30">Mail:<Link href="#">info@ajcon@gmail.com</Link></p>
                                    <p>Address:<Link href="#">2464 Royal Ln. Mesa, New Jersey.</Link></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="header-sticky" className={`tp-header-7-main sticky-pest-bg ${isSticky ? "header-sticky" : ""}`}>
                    <div className="container container-1510">
                        <div className="row align-items-center">
                            <div className="col-xl-2 col-lg-6 col-6">
                                <div className="tp-header-logo">
                                    <Link href="/">
                                        <Image width={120} height={19} src="/assets/img/logo/logo-white-solid.png" alt="logo" />
                                    </Link>
                                </div>
                            </div>
                            <div className="col-xl-6 d-none d-xl-block">
                                <div className="tp-header-box tp-header-cr">
                                    <div className="tp-header-menu tp-header-dropdown dropdown-pest-bg">
                                        <nav className="tp-mobile-menu-active">
                                            <NavMenus bgClassName={bgClassName} />
                                        </nav>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-6">
                                <div className="tp-header-right d-flex align-items-center justify-content-end">
                                    <div className="tp-header-7-info mr-15 d-xxl-block d-none">
                                        <Link href="tel:0123456789">
                                            <span>
                                                <PhoneIcon />
                                            </span>
                                            +(704) 555-0127
                                        </Link>
                                    </div>
                                    <div className="tp-header-btn-box ml-25 d-none d-md-block">
                                        <Link href="/contact-us" className="tp-btn-green tp-btn-anim bdr-5">
                                            <div className="tp-btn-text">Lets Talk </div>
                                            <span>
                                                <ArrowIconFive />
                                            </span>
                                        </Link>
                                    </div>
                                    <div className="tp-header-bar ml-20 d-xl-none">
                                        <button onClick={() => setOpenOffCanvas(true)} className="tp-offcanvas-open-btn">
                                            <i></i>
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
            {/* Off Canvas Panel */}
            <OffCanvasPanel
                openOffcanvas={openOffCanvas}
                setOpenOffcanvas={setOpenOffCanvas}
            />
        </>
    );
};

export default CorporateAgencyHeader;