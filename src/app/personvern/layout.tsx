/**
 * Skall for /personvern.
 *
 * VIKTIG: denne siden skal ha SAMME header og footer som forsiden.
 * Den brukte tidligere malens `CommonHeader` og `AboutFooter` – sistnevnte
 * inneholder demo-innhold fra ThemeForest-malen («support@gmail.com»,
 * «+452-(239) 555-010», «Join our newsletter»), som ville blitt publisert
 * på usett.no. Bruk DesignStudioHeader/DesignStudioFooter, ikke mal-variantene.
 *
 * Providerne er de samme som i app/page.tsx, så siden får riktig bakgrunn,
 * markør, smooth scroll og reveal-animasjoner.
 */
import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import DesignStudioHeader from "@/layouts/headers/DesignStudioHeader";
import DesignStudioFooter from "@/layouts/footers/DesignStudioFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function PersonvernLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <VideoProvider>
            <BootstrapLoader>
                <ScrollSmoothProvider>
                    <CursorAndBackgroundProvider bgColor="#F5F7F5">
                        <AnimationWrapper>
                            <div id="magic-cursor" className="cursor-white-bg">
                                <div id="ball"></div>
                            </div>
                            <div className="tp-blur-bottom"></div>
                            <DesignStudioHeader />
                            <BackToTop />
                            <div id="smooth-wrapper">
                                <div id="smooth-content">
                                    {children}
                                    <DesignStudioFooter />
                                </div>
                            </div>
                        </AnimationWrapper>
                    </CursorAndBackgroundProvider>
                </ScrollSmoothProvider>
            </BootstrapLoader>
        </VideoProvider>
    );
}
