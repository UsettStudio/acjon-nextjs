import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import PortfolioWebglHeader from "@/layouts/headers/PortfolioWebglHeader";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function PortfolioWebglLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <VideoProvider>
            <BootstrapLoader>
                <CursorAndBackgroundProvider bgColor='#000'>
                    <div id="magic-cursor" className="cursor-white-bg">
                        <div id="ball"></div>
                    </div>
                    {/* Global Components */}
                    <BackToTop />
                    <PortfolioWebglHeader />
                    {children}
                </CursorAndBackgroundProvider>
            </BootstrapLoader>
        </VideoProvider>
    )
};