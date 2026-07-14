import DesignStudioTextSlider from "@/components/text-slider/DesignStudioTextSlider";
// Kundelogo-stripe deaktivert (venter på ekte kundelogoer) – aktiver igjen ved å avkommentere denne + bruken under.
// import BusinessConsultingBrand from "@/components/brand/BusinessConsultingBrand";
import DesignStudioPortfolio from "@/components/portfolio/DesignStudioPortfolio";
import PinnedVideoScrub from "@/components/scroll-cinematic/PinnedVideoScrub";
import HashScroll from "@/components/scroll-cinematic/HashScroll";
import OnePageLinks from "@/components/scroll-cinematic/OnePageLinks";
import DesignStudioService from "@/components/service/DesignStudioService";
import DesignStudioPrice from "@/components/price/DesignStudioPrice";
import DesignStudioAbout from "@/components/about/DesignStudioAbout";
import DesignStudioHero from "@/components/hero/DesignStudioHero";
import HomeKontakt from "@/components/contact/HomeKontakt";
import StudioJsonLd from "@/components/seo/StudioJsonLd";
import FaqSection from "@/components/seo/FaqSection";
import { siteConfig } from "@/data/siteConfig";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: { absolute: "3D-visualisering i Østfold – Usett 3D Studio" },
    description:
        "Usett er 3D-studioet i Østfold for fotorealistisk 3D-visualisering, interiør og eksteriør, foto- og dronemontasje, 3D-animasjon, 2D-plantegninger, 3D-skanning og hjemmesider. Rask levering til Fredrikstad, Sarpsborg, Moss og hele Østfold.",
    keywords: [
        "3D-visualisering Østfold",
        "3D-visualisering Fredrikstad",
        "3D-visualisering Sarpsborg",
        "3D-visualisering Moss",
        "arkitekturvisualisering Østfold",
        "interiørvisualisering",
        "eksteriørvisualisering",
        "3D-animasjon",
        "3D-skanning Østfold",
        "Digital Twin",
        "dronefoto fotomontasje",
        "2D-plantegninger",
        "hjemmesider Østfold",
        "Usett 3D Studio",
    ],
    alternates: { canonical: "/design-studio" },
    openGraph: {
        type: "website",
        locale: siteConfig.locale,
        url: "/design-studio",
        siteName: siteConfig.legalName,
        title: "3D-visualisering i Østfold | Usett 3D Studio",
        description:
            "Fotorealistisk 3D-visualisering, interiør, eksteriør, dronemontasje, animasjon, plantegninger og 3D-skanning i Fredrikstad, Sarpsborg, Moss og hele Østfold.",
        images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "Usett 3D Studio – 3D-visualisering i Østfold" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "3D-visualisering i Østfold | Usett 3D Studio",
        description:
            "Fotorealistisk 3D-visualisering, animasjon, plantegninger og 3D-skanning i Østfold – Fredrikstad, Sarpsborg og Moss.",
        images: [siteConfig.ogImage],
    },
};

const page = () => {
    return (
        <main>
            <StudioJsonLd />
            <HashScroll />
            <OnePageLinks />

            <div id="top">
                <DesignStudioHero />
            </div>

            <DesignStudioPrice />
            <DesignStudioTextSlider />

            <section id="tjenester">
                <DesignStudioService />
            </section>

            <section id="prosjekter">
                <DesignStudioPortfolio />
            </section>

            {/* Cinematisk scroll-video av ferdig hus (uten tekst) */}
            <section id="byggeprosessen">
                <PinnedVideoScrub
                    src="/assets/scroll/hus.mp4"
                    scrollFactor={4.5}
                />
            </section>

            <section id="om-oss">
                <DesignStudioAbout />
            </section>

            {/* Kundelogo-stripe deaktivert (venter på ekte kundelogoer) – avkommenter for å vise igjen. */}
            {/* <BusinessConsultingBrand /> */}

            <FaqSection />

            <section id="kontakt">
                <HomeKontakt />
            </section>
        </main>
    );
};

export default page;
