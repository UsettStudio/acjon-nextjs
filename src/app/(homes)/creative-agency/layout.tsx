import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import CreativeAgencyFooter from "@/layouts/footers/CreativeAgencyFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import CommonHeader from "@/layouts/headers/CommonHeader";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function AgencyLayout({
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
                        <CommonHeader btnVariantStyle="black-menu-btn" stickyHeaderColor="sticky-black-bg"
                            borderVariantClass='' megaMenuBgClassName='megamenu-black-bg' dropdownBgVariant='dropdown-black-bg' />
                        <div className='tp-blur-bottom'></div>
                        <BackToTop />
                        <div id="smooth-wrapper">
                            <div id="smooth-content">
                                {children}
                                <CreativeAgencyFooter />
                            </div>
                        </div>
                    </AnimationWrapper>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};