import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import ImageHoverRevealProvider from "@/provider/ImageHoverRevealProvider";
import StartupAgencyHeader from "@/layouts/headers/StartupAgencyHeader";
import StartupAgencyFooter from "@/layouts/footers/StartupAgencyFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function StartupAgencyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <VideoProvider>
            <BootstrapLoader>
                <ScrollSmoothProvider>
                    <CursorAndBackgroundProvider bgColor='#F5F7F5'>
                        <ImageHoverRevealProvider>
                            <AnimationWrapper>
                                <div id="magic-cursor" className="cursor-white-bg">
                                    <div id="ball"></div>
                                </div>
                                <StartupAgencyHeader />
                                <div className='tp-blur-bottom'></div>
                                <BackToTop />
                                <div id="smooth-wrapper">
                                    <div id="smooth-content">
                                        {children}
                                        <StartupAgencyFooter />
                                    </div>
                                </div>
                            </AnimationWrapper>
                        </ImageHoverRevealProvider>
                    </CursorAndBackgroundProvider>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};