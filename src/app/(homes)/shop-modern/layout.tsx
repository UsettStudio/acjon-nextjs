import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import ShopModernFooter from "@/layouts/footers/ShopModernFooter";
import ShopModernHeader from "@/layouts/headers/ShopModernHeader";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function ShopModernLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <VideoProvider>
            <BootstrapLoader>
                <ScrollSmoothProvider>
                    <CursorAndBackgroundProvider bgColor='white'>
                        <AnimationWrapper>
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
                    </CursorAndBackgroundProvider>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};