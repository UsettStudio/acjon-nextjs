import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import ShopModernHeader from "@/layouts/headers/ShopModernHeader";
import ShopModernFooter from "@/layouts/footers/ShopModernFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import BootstrapLoader from "@/layouts/BootstrapLoader";
import { VideoProvider } from "@/provider/VideoProvider";

export default function TeamLayout({
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
                        <ShopModernHeader />
                        <div id="smooth-wrapper">
                            <div id="smooth-content">
                                {children}
                                <ShopModernFooter />
                            </div>
                        </div>
                    </AnimationWrapper>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};