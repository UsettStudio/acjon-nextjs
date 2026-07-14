
import DigittalMarketingService from "@/components/service/DigittalMarketingService";
import DigitalMarketingFunfact from "@/components/funfact/DigitalMarketingFunfact";
import DigitalMarketingProject from "@/components/project/DigitalMarketingProject";
import DigitalMTestimonial from "@/components/testimonial/DigitalMTestimonial";
import DigitalMarketingAward from "@/components/award/DigitalMarketingAward";
import DigitalMarketingBrand from "@/components/brand/DigitalMarketingBrand";
import DigitalMProcessArea from "@/components/process/DigitalMProcessArea";
import DigitalMarketingBlog from "@/components/blog/DigitalMarketingBlog";
import DigitalMarketingHero from "@/components/hero/DigitalMarketingHero";
import DigitalMarketingTeam from "@/components/team/DigitalMarketingTeam";
import DigitalMarketingAbout from "@/components/about/DigitalMAbout";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Digital Marketing - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <DigitalMarketingHero />
            <DigittalMarketingService />
            <DigitalMarketingAbout />
            <DigitalMarketingProject />
            <DigitalMProcessArea />
            <DigitalMarketingFunfact />
            <DigitalMTestimonial />
            <DigitalMarketingTeam />
            <DigitalMarketingAward />
            <DigitalMarketingBlog />
            <DigitalMarketingBrand />
        </main>
    );
};

export default page;