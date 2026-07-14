"use client";
import MenuStyleTwo from '@/components/offcanvus/subComponents/MenuStyleTwo';
import OffCanvasPanelTwo from '@/components/offcanvus/OffCanvasPanelTwo';
import { ArrowIconEight } from '@/svg/ArrowIcon';
import { useState } from 'react';
import { BarIcon } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const PersonalPortfolioHeader = () => {
    const [openOffcanvas, setOpenOffcanvas] = useState(false);

    return (
        <>
            <div className="tp-header-ptb">
                <div className="tp-header-port-wrap">
                    <div className="tp-header-port-logo">
                        <Link href="/">
                            <Image
                                src="/assets/img/logo/logo-white.png"
                                width={120}
                                height={15}
                                alt="logo"
                            />
                        </Link>
                    </div>
                    <div onClick={() => setOpenOffcanvas(true)} className="tp-header-port-bar tp-offcanvas-open-btn">
                        <span><BarIcon /></span>
                    </div>
                    <div className="tp-header-port-btn-wrap d-none d-md-block">
                        <Link href="/contact-me" className="tp-header-port-btn">
                            lets talk
                            <span><ArrowIconEight /></span>
                        </Link>
                    </div>
                </div>
            </div>
            <nav className="tp-mobile-menu-active d-none">
                <ul>
                    <MenuStyleTwo />
                </ul>
            </nav>

            {/* off canvas */}
            <OffCanvasPanelTwo
                openOffcanvas={openOffcanvas}
                setOpenOffcanvas={setOpenOffcanvas}
            />
            {/* off canvas */}
        </>
    );
};

export default PersonalPortfolioHeader;