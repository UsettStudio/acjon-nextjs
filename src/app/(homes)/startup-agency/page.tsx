import StartupAgencyTestimonial from "@/components/testimonial/StartupAgencyTestimonial";
import StartupAgencyService from "@/components/service/StartupAgencyService";
import StartupAgencyAbout from "@/components/about/StartupAgencyAbout";
import StartupAgencyWorkArea from "@/components/work/StartupAgencyWork";
import StartupAgencyAward from "@/components/award/StartupAgencyAward";
import CommonBannerArea from "@/components/banner/CommonBannerArea";
import StartupAgencyBlog from "@/components/blog/StartupAgencyBlog";
import StartupAgencyFaq from "@/components/faq/StartupAgencyFaq";
import StartupAgencyHero from "@/components/hero/StartupAgencyHero";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Startup Agency - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <StartupAgencyHero />
            <CommonBannerArea wrapClass="sa-banner-area" subWrapClass="sa-banner-wrapper" bannerThumb="/assets/img/startup-agancy/banner/banner-thumb-1.jpg" />
            <StartupAgencyAbout />
            <StartupAgencyService />
            <StartupAgencyWorkArea />
            <StartupAgencyAward />
            <StartupAgencyTestimonial />
            <StartupAgencyFaq />
            <StartupAgencyBlog />
        </main>
    );
};

export default page;