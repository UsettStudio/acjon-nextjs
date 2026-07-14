import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import CorporateAFooter from "@/layouts/footers/CorporateAFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import BootstrapLoader from "@/layouts/BootstrapLoader";
import CommonHeader from "@/layouts/headers/CommonHeader";
import { VideoProvider } from "@/provider/VideoProvider";

export default function AboutUsLayout({
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
                            {/* -- global component -- */}
                            <div id="magic-cursor" className="cursor-white-bg">
                                <div id="ball"></div>
                            </div>
                            <div className='tp-blur-bottom'></div>
                            <BackToTop />
                            <CommonHeader headerMenuVariant='tp-header-5-menu' variant="single" HeaderVeriantColor='#fff' />
                            <div id="smooth-wrapper">
                                <div id="smooth-content">
                                    {children}
                                    <CorporateAFooter />
                                </div>
                            </div>
                        </AnimationWrapper>
                    </CursorAndBackgroundProvider>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};