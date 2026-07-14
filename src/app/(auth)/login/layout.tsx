import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import BootstrapLoader from "@/layouts/BootstrapLoader";
import ShopModernFooter from "@/layouts/footers/ShopModernFooter";
import ShopModernHeader from "@/layouts/headers/ShopModernHeader";

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <BootstrapLoader>
            <ScrollSmoothProvider>
                <AnimationWrapper>
                    {/* -- global component -- */}
                    <div id="magic-cursor" className="cursor-white-bg">
                        <div id="ball"></div>
                    </div>
                    <div className='tp-blur-bottom'></div>
                    <BackToTop />
                    <ShopModernHeader headerBorder='tp-header-border' />
                    <div id="smooth-wrapper">
                        <div id="smooth-content">
                            {children}
                            <ShopModernFooter />
                        </div>
                    </div>
                </AnimationWrapper>
            </ScrollSmoothProvider>
        </BootstrapLoader>
    )
};