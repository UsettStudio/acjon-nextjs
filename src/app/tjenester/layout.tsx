import DesignStudioHeader from "@/layouts/headers/DesignStudioHeader";
import DesignStudioFooter from "@/layouts/footers/DesignStudioFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import BootstrapLoader from "@/layouts/BootstrapLoader";

/**
 * Layout for tjenesteoversikten og de enkelte tjenestesidene.
 * Uten ScrollSmoothProvider – tekstsider skal bruke nettleserens egen
 * scrolling, ellers lander ankerlenker og treff fra søkeresultater feil.
 */
export default function TjenesterLayout({ children }: { children: React.ReactNode }) {
    return (
        <BootstrapLoader>
            <DesignStudioHeader />
            <BackToTop />
            {children}
            <DesignStudioFooter />
        </BootstrapLoader>
    );
}
