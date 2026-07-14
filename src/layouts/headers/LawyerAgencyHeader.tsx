"use client"
import OffCanvasPanel from '@/components/offcanvus/OffCanvasPanel';
import useStickyHeader from '@/hooks/useStickyHeader';
import { ArrowIconFourteen } from '@/svg/ArrowIcon';
import NavMenus from '../subComponents/NavMenus';
import { useState } from 'react';
import { PhoneIcon } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const LawyerAgencyHeader = () => {
    const [openOffcanvas, setOpenOffcanvas] = useState(false);
    const isSticky = useStickyHeader(20);
    return (
        <>
            <div id="header-sticky" className={`tp-header-area tp-header-blur sticky-black-bg header-transparent ${isSticky ? 'header-sticky' : ''}`}>
                <div className="container container-1510">
                    <div className="row align-items-center">
                        <div className="col-xxl-2 col-xl-2 col-lg-6 col-6">
                            <div className="tp-header-10-logo">
                                <Link href="/">
                                    <Image width={116} height={18} src="/assets/img/logo/logo-white-solid.png" alt="logo" />
                                </Link>
                            </div>
                        </div>
                        <div className="col-xxl-6 col-xl-7 d-none d-xl-block">
                            <div className="tp-header-box">
                                <div className="tp-header-menu tp-header-dropdown dropdown-black-bg">
                                    <nav className="tp-mobile-menu-active">
                                        <NavMenus />
                                    </nav>
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-4 col-xl-3 col-lg-6 col-6">
                            <div className="tp-header-10-right d-flex align-items-center justify-content-end">
                                <div className="tp-header-7-info d-xxl-block d-none">
                                    <Link href="tel:0123456789">
                                        <span>
                                            <PhoneIcon />
                                        </span>{" "}
                                        +(704) 555-0127
                                    </Link>
                                </div>
                                <div className="tp-header-10-btn-box ml-30 d-none d-md-block">
                                    <Link href="/job-application-form" className="tp-btn-green tp-btn-anim">
                                        <div className="tp-btn-text">Apply Now</div>
                                        <span>
                                            <ArrowIconFourteen />
                                        </span>
                                    </Link>
                                </div>
                                <div className="tp-header-bar ml-30">
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

            {/* off canvas */}
            <OffCanvasPanel
                openOffcanvas={openOffcanvas}
                setOpenOffcanvas={setOpenOffcanvas}
                bgClassName='offcanvas-black-bg'
            />
            {/* off canvas */}
        </>
    );
};

export default LawyerAgencyHeader;