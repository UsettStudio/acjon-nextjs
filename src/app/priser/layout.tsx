import DesignStudioHeader from "@/layouts/headers/DesignStudioHeader";
import DesignStudioFooter from "@/layouts/footers/DesignStudioFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import BootstrapLoader from "@/layouts/BootstrapLoader";

/**
 * Layout for prissiden.
 * Uten ScrollSmoothProvider – en tekstside skal bruke nettleserens egen
 * scrolling, og smooth-scroll gjør at ankerlenker og søkeresultat-hopp
 * lander feil.
 */
export default function PriserLayout({ children }: { children: React.ReactNode }) {
    return (
        <BootstrapLoader>
            <DesignStudioHeader />
            <BackToTop />
            {children}
            <DesignStudioFooter />
        </BootstrapLoader>
    );
}
