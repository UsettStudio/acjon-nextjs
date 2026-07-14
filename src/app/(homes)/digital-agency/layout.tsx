import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import CommonHeader from "@/layouts/headers/CommonHeader";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";
import HomeFooter from "@/layouts/footers/HomeFooter";

export default function DigitalAgencyLayout({
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
                            <CommonHeader />
                            <div className='tp-blur-bottom'></div>
                            <BackToTop />
                            <div id="smooth-wrapper">
                                <div id="smooth-content">
                                    {children}
                                    <HomeFooter />
                                </div>
                            </div>
                        </AnimationWrapper>
                    </CursorAndBackgroundProvider>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};