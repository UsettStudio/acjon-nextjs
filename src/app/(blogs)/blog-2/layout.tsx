import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import CommonHeader from "@/layouts/headers/CommonHeader";
import AboutFooter from "@/layouts/footers/AboutFooter";
import BootstrapLoader from "@/layouts/BootstrapLoader";
import { VideoProvider } from "@/provider/VideoProvider";

export default function BlogTwoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <VideoProvider>
            <BootstrapLoader>
                <ScrollSmoothProvider>
                    <CursorAndBackgroundProvider>
                        <AnimationWrapper>
                            {/* global*/}
                            <div id="magic-cursor" className="cursor-white-bg">
                                <div id="ball"></div>
                            </div>
                            <div className="tp-blur-bottom"></div>

                            <BackToTop />
                            <CommonHeader
                                headerMenuVariant="tp-header-5-menu"
                                variant="single"
                                HeaderVeriantColor="#fff"
                            />

                            <div id="smooth-wrapper">
                                <div id="smooth-content">
                                    {children}
                                    <AboutFooter />
                                </div>
                            </div>
                        </AnimationWrapper>
                    </CursorAndBackgroundProvider>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};