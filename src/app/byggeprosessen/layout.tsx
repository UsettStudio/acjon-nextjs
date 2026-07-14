import DesignStudioHeader from "@/layouts/headers/DesignStudioHeader";
import DesignStudioFooter from "@/layouts/footers/DesignStudioFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import BootstrapLoader from "@/layouts/BootstrapLoader";

/**
 * Egen layout for byggeprosessen-siden.
 * NB: Uten ScrollSmoothProvider – scroll-skrubbingen bruker
 * position:sticky, som krever vanlig (nativ) scrolling.
 */
export default function ByggeprosessenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <BootstrapLoader>
            <DesignStudioHeader />
            <BackToTop />
            {children}
            <DesignStudioFooter />
        </BootstrapLoader>
    );
}
