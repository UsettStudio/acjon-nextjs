import PersonalPortfolioService from "@/components/service/PersonalPortfolioService";
import PersonalPortfolioAward from "@/components/award/PersonalPortfolioAward";
import AboutMeInstagram from "@/components/instagram/AboutMeInstagram";
import AboutMeBanner from "@/components/banner/AboutMeBanner";
import AboutMeAbout from "@/components/about/AboutMeAbout";
import AboutMeBrand from "@/components/brand/AboutMeBrand";
import AboutUsHero from "@/components/hero/AboutUsHero";
import AboutMeFaq from "@/components/faq/AboutMeFaq";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Me Business Consulting - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <AboutUsHero />
            <AboutMeBrand />
            <AboutMeAbout />
            <PersonalPortfolioService sectionPaddingClass="mb-140" showDecorativeShape={true} />
            <PersonalPortfolioAward sectionBgColor='' sectionPaddingClass="pt-20 pb-150" />
            <AboutMeBanner />
            <AboutMeFaq />
            <AboutMeInstagram />
        </main>
    );
};

export default page;