import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import BootstrapLoader from "@/layouts/BootstrapLoader";
import AboutFooter from "@/layouts/footers/AboutFooter";
import CommonHeader from "@/layouts/headers/CommonHeader";

export default function FaqLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <BootstrapLoader>
            <ScrollSmoothProvider>
                <AnimationWrapper>
                    {/* Global UI */}
                    <div id="magic-cursor" className="cursor-white-bg">
                        <div id="ball"></div>
                    </div>
                    <div className="tp-blur-bottom"></div>
                    <BackToTop />
                    <CommonHeader
                        variant="single"
                        headerMenuVariant="tp-header-5-menu"
                        borderVariantClass="tp-header-border"
                    />
                    <div id="smooth-wrapper">
                        <div id="smooth-content">
                            {children}
                            <AboutFooter />
                        </div>
                    </div>
                </AnimationWrapper>
            </ScrollSmoothProvider>
        </BootstrapLoader>
    );
}
