"use client"
import OffCanvasPanel from '@/components/offcanvus/OffCanvasPanel';
import useStickyHeader from '@/hooks/useStickyHeader';
import { ButtonArrowIcon, MenubarIcon } from '@/svg';
import NavMenus from '../subComponents/NavMenus';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CommonHeaderProps {
    btnVariantStyle?: 'black-menu-btn' | string;
    stickyHeaderColor?: string;
    headerMenuVariant?: string;
    variant?: "single" | "dual";
    HeaderVeriantColor?: string;
    borderVariantClass?: string;
    megaMenuBgClassName?: string;
    dropdownBgVariant?: string;
}

const CommonHeader: React.FC<CommonHeaderProps> = (
    {
        btnVariantStyle,
        stickyHeaderColor = "sticky-white-bg",
        headerMenuVariant = "",
        variant = "dual",
        HeaderVeriantColor = "",
        borderVariantClass = "tp-header-border",
        megaMenuBgClassName = "megamenu-white-bg",
        dropdownBgVariant = "dropdown-white-bg"
    }) => {
    const [openOffCanvas, setOpenOffCanvas] = useState(false);
    const isSticky = useStickyHeader(20);
    const isBlackMenu = btnVariantStyle === 'black-menu-btn';

    // Header button configurations
    const headerButtonConfig = {
        black: {
            wrapperClass: "tp-header-14-bar-wrap",
            buttonClass: "tp-header-8-bar tp-offcanvas-open-btn",
            text: "Menu",
            icon: <MenubarIcon />
        },
        default: {
            contactBtn: {
                wrapperClass: "tp-header-btn-box ml-25 d-none d-md-block",
                linkClass: "tp-btn-green tp-btn-anim",
                text: "Get In touch",
                icon: <ButtonArrowIcon />
            },
            menuBtn: {
                wrapperClass: "tp-header-bar ml-20 d-xl-none",
                buttonClass: "tp-offcanvas-open-btn",
                bars: [1, 2, 3]
            }
        }
    };

    return (
        <>
            <header style={{ backgroundColor: HeaderVeriantColor }} className={`tp-header-area tp-header-ptb tp-header-blur ${stickyHeaderColor}  header-transparent ${borderVariantClass}  ${isSticky ? 'header-sticky' : ''}`}
            >
                <div className="container container-1510">
                    <div className="row align-items-center">
                        {/* Logo Section */}
                        <div className="col-xl-2 col-lg-6 col-6">
                            <div className="tp-header-logo">
                                <Link href="/" aria-label="Home page">
                                    {variant === "single" ? (
                                        <Image
                                            width={120}
                                            height={19}
                                            src="/assets/img/logo/logo-black.png"
                                            alt="Logo Dark"
                                            priority
                                        />
                                    ) : (
                                        <>
                                            <Image
                                                className="logo-white"
                                                width={120}
                                                height={19}
                                                src="/assets/img/logo/logo-white.png"
                                                alt="Logo White"
                                                priority
                                            />
                                            <Image
                                                className="logo-black"
                                                width={120}
                                                height={19}
                                                src="/assets/img/logo/logo-black.png"
                                                alt="Logo Dark"
                                                priority
                                            />
                                        </>
                                    )}
                                </Link>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="col-xl-7 d-none d-xl-block">
                            <div className="tp-header-box text-center">
                                <div className={`tp-header-menu ${headerMenuVariant} tp-header-dropdown ${dropdownBgVariant}`}>
                                    <nav className="tp-mobile-menu-active" aria-label="Main navigation">
                                        <NavMenus bgClassName={megaMenuBgClassName} />
                                    </nav>
                                </div>
                            </div>
                        </div>

                        {/* Header Right Section */}
                        <div className="col-xl-3 col-lg-6 col-6">
                            <div className="tp-header-right d-flex align-items-center justify-content-end">
                                {isBlackMenu ? (
                                    // Black Menu Button Variant
                                    <div className={headerButtonConfig.black.wrapperClass}>
                                        <button
                                            onClick={() => setOpenOffCanvas(true)}
                                            className={headerButtonConfig.black.buttonClass}
                                            aria-label="Open menu"
                                        >
                                            <span>{headerButtonConfig.black.text}</span>{" "}
                                            <span>{headerButtonConfig.black.icon}</span>
                                        </button>
                                    </div>
                                ) : (
                                    // Default Button Variant
                                    <>
                                        <div className={headerButtonConfig.default.contactBtn.wrapperClass}>
                                            <Link
                                                href="/contact-us"
                                                className={headerButtonConfig.default.contactBtn.linkClass}
                                            >
                                                <div className="tp-btn-text">
                                                    {headerButtonConfig.default.contactBtn.text}
                                                </div>
                                                <span>{headerButtonConfig.default.contactBtn.icon}</span>
                                            </Link>
                                        </div>
                                        <div
                                            onClick={() => setOpenOffCanvas(true)}
                                            className={headerButtonConfig.default.menuBtn.wrapperClass}
                                            role="button"
                                            tabIndex={0}
                                            aria-label="Open mobile menu"
                                            onKeyPress={(e) => e.key === 'Enter' && setOpenOffCanvas(true)}
                                        >
                                            <button className={headerButtonConfig.default.menuBtn.buttonClass}>
                                                {headerButtonConfig.default.menuBtn.bars.map((bar) => (
                                                    <i key={bar}></i>
                                                ))}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Off Canvas Panel */}
            <OffCanvasPanel
                openOffcanvas={openOffCanvas}
                setOpenOffcanvas={setOpenOffCanvas}
            />
        </>
    );
};

export default CommonHeader;