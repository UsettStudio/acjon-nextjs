import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import PersonalPortfolioHeader from "@/layouts/headers/PersonalPortfolioHeader";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function PersonalPortfolioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <VideoProvider>
            <BootstrapLoader>
                <CursorAndBackgroundProvider bgColor='#110C04'>
                    {/* -- Begin magic cursor -- */}
                    <div id="magic-cursor" className="cursor-white-bg">
                        <div id="ball"></div>
                    </div>
                    <div className="tp-blur-bottom"></div>
                    <BackToTop />
                    <PersonalPortfolioHeader />
                    {children}
                </CursorAndBackgroundProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};