import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import LawyerAgencyHeader from "@/layouts/headers/LawyerAgencyHeader";
import LawyerAgencyFooter from "@/layouts/footers/LawyerAgencyFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function LawyerAgencyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <VideoProvider>
            <BootstrapLoader>
                <ScrollSmoothProvider>
                    <CursorAndBackgroundProvider bgColor='#101F1E'>
                        <AnimationWrapper>
                            <div className='tp-blur-bottom'></div>
                            <BackToTop />
                            <LawyerAgencyHeader />
                            <div id="smooth-wrapper">
                                <div id="smooth-content">
                                    {children}
                                    <LawyerAgencyFooter />
                                </div>
                            </div>
                        </AnimationWrapper>
                    </CursorAndBackgroundProvider>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};