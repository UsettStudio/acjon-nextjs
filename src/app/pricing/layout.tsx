import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import StartupAgencyFooter from "@/layouts/footers/StartupAgencyFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import CommonHeader from "@/layouts/headers/CommonHeader";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function PricingLayout({
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
                    <CommonHeader variant="single" headerMenuVariant='tp-header-5-menu' borderVariantClass='tp-header-border' />
                    <div id="smooth-wrapper">
                        <div id="smooth-content">
                            {children}
                            <StartupAgencyFooter />
                        </div>
                    </div>
                </AnimationWrapper>
            </ScrollSmoothProvider>
        </BootstrapLoader>
    );
}
