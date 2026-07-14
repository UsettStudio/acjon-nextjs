import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import CommonHeader from "@/layouts/headers/CommonHeader";
import AboutFooter from "@/layouts/footers/AboutFooter";
import BootstrapLoader from "@/layouts/BootstrapLoader";
import { VideoProvider } from "@/provider/VideoProvider";

export default function CareerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <VideoProvider>
            <BootstrapLoader>
                <ScrollSmoothProvider>
                    <AnimationWrapper>
                        {/* -- global component -- */}
                        <div id="magic-cursor" className="cursor-white-bg">
                            <div id="ball"></div>
                        </div>
                        <div className='tp-blur-bottom'></div>
                        <BackToTop />
                        <CommonHeader variant="dual" borderVariantClass='tp-header-black-border' />
                        <div id="smooth-wrapper">
                            <div id="smooth-content">
                                {children}
                                <AboutFooter />
                            </div>
                        </div>
                    </AnimationWrapper>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};