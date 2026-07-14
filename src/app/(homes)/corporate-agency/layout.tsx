import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import CorporateAgencyHeader from "@/layouts/headers/CorporateAgencyHeader";
import CorporateAFooter from "@/layouts/footers/CorporateAFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import BootstrapLoader from "@/layouts/BootstrapLoader";
import { VideoProvider } from "@/provider/VideoProvider";

export default function CorporateALayout({
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
                            <CorporateAgencyHeader bgClassName="megamenu-pest-bg" />
                            <div className='tp-blur-bottom'></div>
                            <BackToTop />
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