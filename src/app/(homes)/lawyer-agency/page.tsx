import LawyerAgencyTestimonial from "@/components/testimonial/LawyerAgencyTestimonial";
import LawyerAgencyTextSlider from "@/components/text-slider/LawyerAgencyTextSlider";
import LawyerAgencyServiceTwo from "@/components/service/LawyerAgencyServiceTwo";
import LawyerAgencyProject from "@/components/project/LawyerAgencyProject";
import LawyerAgencyService from "@/components/service/LawyerAgencyService";
import LawyerAgencyBanner from "@/components/banner/LawyerAgencyBanner";
import LawyerAgencyChoose from "@/components/choose/LawyerAgencyChoose";
import LawyerAgencyAbout from "@/components/about/LawyerAgencyAbout";
import LawyerAgencyBrand from "@/components/brand/LawyerAgencyBrand";
import LawyerAgencyVideo from "@/components/video/LawyerAgencyVideo";
import LawyerAgencyPrice from '@/components/price/LawyerAgencyPrice';
import LawyerAgencyHero from "@/components/hero/LawyerAgencyHero";
import LawyerAgencyTeam from "@/components/team/LawyerAgencyTeam";
import LawyerAgencyBlog from "@/components/blog/LawyerAgencyBlog";
import LawyerAgencyCta from "@/components/cta/LawyerAgencyCta";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lawyer Agency - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <LawyerAgencyHero />
            <LawyerAgencyBanner />
            <LawyerAgencyService />
            <LawyerAgencyCta />
            <LawyerAgencyAbout />
            <LawyerAgencyBrand />
            <LawyerAgencyServiceTwo />
            <LawyerAgencyProject />
            <LawyerAgencyVideo />
            <LawyerAgencyChoose />
            <LawyerAgencyTextSlider />
            <LawyerAgencyTeam />
            <LawyerAgencyPrice />
            <LawyerAgencyTestimonial />
            <LawyerAgencyBlog />
        </main>
    );
};

export default page;