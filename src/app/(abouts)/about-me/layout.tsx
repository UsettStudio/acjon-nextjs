"use client";

import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import PersonalPortfolioFooter from "@/layouts/footers/PersonalPortfolioFooter";
import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import AboutMeHeader from "@/layouts/headers/AboutMeHeader";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function AboutMeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <VideoProvider>
            <BootstrapLoader>
                <ScrollSmoothProvider>
                    <CursorAndBackgroundProvider bgColor='#110C04'>
                        <AnimationWrapper>
                            {/* -- global component -- */}
                            <div id="magic-cursor" className="cursor-white-bg">
                                <div id="ball"></div>
                            </div>
                            <div className='tp-blur-bottom'></div>
                            <BackToTop />
                            <AboutMeHeader />
                            <div id="smooth-wrapper">
                                <div id="smooth-content">
                                    {children}
                                    <PersonalPortfolioFooter sectionPaddingClass='pt-160' sectionBgColor='#0D0800' showDecorativeShape={true} />
                                </div>
                            </div>
                        </AnimationWrapper>
                    </CursorAndBackgroundProvider>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    );
}
