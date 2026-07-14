import DesignStudioHeader from "@/layouts/headers/DesignStudioHeader";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

export default function PortfolioSkewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <VideoProvider>
            <BootstrapLoader>
                <div className="tp-blur-bottom"></div>
                <DesignStudioHeader containerPaddingSpacing="container-1750" zIndexOpacity="z-index-9999" />
                {children}
            </BootstrapLoader>
        </VideoProvider>
    )
};