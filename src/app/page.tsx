// Forsiden ligger nå på roten "/" (usett.no) – ikke lenger /design-studio.
// Vi gjenskaper her samme "skall" som (homes)/design-studio/layout.tsx ga
// (providere + header + footer + smooth-scroll), med forside-innholdet inni.
import CursorAndBackgroundProvider from "@/components/provider/CustomCursorProvider";
import ScrollSmoothProvider from "@/components/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import DesignStudioHeader from "@/layouts/headers/DesignStudioHeader";
import DesignStudioFooter from "@/layouts/footers/DesignStudioFooter";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import { VideoProvider } from "@/provider/VideoProvider";
import BootstrapLoader from "@/layouts/BootstrapLoader";

import DesignStudioTextSlider from "@/components/text-slider/DesignStudioTextSlider";
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
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        locale: siteConfig.locale,
        url: "/",
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

export default function Page() {
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

                                        <FaqSection />

                                        <section id="kontakt">
                                            <HomeKontakt />
                                        </section>
                                    </main>
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
