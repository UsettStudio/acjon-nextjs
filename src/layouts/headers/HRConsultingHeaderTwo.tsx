"use client";
import OffCanvasPanel from '@/components/offcanvus/OffCanvasPanel';
import { BarIconTwo } from '@/svg/BarIcons';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HRConsultingHeaderTwo = () => {
    const [openOffCanvas, setOpenOffCanvas] = useState(false);

    return (
        <>
            <div id="header-sticky" className="tp-header-area tp-header-ptb tp-header-blur sticky-black-bg header-transparent">
                <div className="container-fluid">
                    <div className="tp-header-hr-main">
                        <div className="col-xl-10 offset-xl-2">
                            <div className="row align-items-center">
                                <div className="col-xl-3 col-6">
                                    <div className="tp-header-hr-logo d-xl-none">
                                        <Link href="/">
                                            <Image width={120} height={20} src="/assets/img/logo/logo-white.png" alt="logo white" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-xl-8 col-6">
                                    <div className="tp-header-right text-end">
                                        <div className="tp-header-14-bar-wrap">
                                            <button onClick={() => setOpenOffCanvas(true)} className="tp-header-8-bar tp-offcanvas-open-btn">
                                                <span>Menu</span>{" "}
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
            </div>

            {/* Off Canvas Panel */}
            <OffCanvasPanel
                openOffcanvas={openOffCanvas}
                setOpenOffcanvas={setOpenOffCanvas}
                bgClassName='offcanvas-black-bg'
            />
        </>
    );
};

export default HRConsultingHeaderTwo;