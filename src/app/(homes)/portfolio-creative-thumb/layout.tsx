import PortfolioThumbSliderHeader from "@/layouts/headers/PortfolioThumbSliderHeader";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function PortfolioCreativeLayout({
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
                {/* Global Components */}
                <PortfolioThumbSliderHeader />
                {children}
            </BootstrapLoader>
        </VideoProvider>
    )
};