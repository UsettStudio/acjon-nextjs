import CreativeAgencyTextSlider from "@/components/text-slider/CreativeAgencyTextSlider";
import CreativeATextSlideTwo from "@/components/text-slider/CreativeATextSlideTwo";
import CreativeATestimonial from "@/components/testimonial/CreativeATestimonial";
import CreativeAgencyProject from "@/components/project/CreativeAgencyProject";
import AgencyAboutThumbSlider from "@/components/about/AgencyAboutThumbSlider";
import CreativeAgencyService from "@/components/service/CreativeAgencyService";
import CreativeAgencyAbout from "@/components/about/CreativeAgencyAbout";
import CreativeAgencyAward from "@/components/award/CreativeAgencyAward";
import CreativeAgencyThumb from "@/components/thumb/CreativeAgencyThumb";
import CreativeAgencyBlog from "@/components/blog/CreativeAgencyBlog";
import CreativeAgencyHero from "@/components/hero/CreativeAgencyHero";
import CreativeAgencyTeam from "@/components/team/CreativeAgencyTeam";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Creative Agency - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main style={{ backgroundColor: "#080808" }}>
            <CreativeAgencyHero />
            <CreativeAgencyTextSlider />
            <CreativeAgencyAbout />
            <AgencyAboutThumbSlider />
            <CreativeAgencyService />
            <CreativeAgencyProject />
            <CreativeAgencyThumb />
            <CreativeAgencyTeam />
            <CreativeATextSlideTwo />
            <CreativeAgencyAward />
            <CreativeATestimonial />
            <CreativeAgencyBlog />
        </main>
    );
};

export default page;