import PortfolioWebglHeader from "@/layouts/headers/PortfolioWebglHeader";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function PortfolioInteractiveLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <VideoProvider>
            <BootstrapLoader>
                <div id="magic-cursor" className="cursor-white-bg">
                    <div id="ball"></div>
                </div>
                <div className="tp-blur-bottom"></div>
                <PortfolioWebglHeader />
                <div id="smooth-wrapper">
                    <div id="smooth-content">
                        {children}
                    </div>
                </div>
            </BootstrapLoader>
        </VideoProvider>
    )
};