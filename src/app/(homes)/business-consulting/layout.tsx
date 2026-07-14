import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import BusinessConsultingFooter from "@/layouts/footers/BusinessConsultingFooter";
import BusinessConsultingHeader from "@/layouts/headers/BusinessConsultingHeader";
import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function BusinessLayout({
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
                            <BusinessConsultingHeader />
                            <div className='tp-blur-bottom'></div>
                            <BackToTop />
                            <div id="smooth-wrapper">
                                <div id="smooth-content">
                                    {children}
                                    <BusinessConsultingFooter />
                                </div>
                            </div>
                        </AnimationWrapper>
                    </CursorAndBackgroundProvider>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};