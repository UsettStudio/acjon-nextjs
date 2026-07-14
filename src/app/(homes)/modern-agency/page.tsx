import ModernAgencyTestimonial from "@/components/testimonial/ModernAgencyTestimonial";
import ModernAgencyFunfact from "@/components/funfact/ModernAgencyFunfact";
import ModernAgencyProject from "@/components/project/ModernAgencyProject";
import ModernAgencyService from "@/components/service/ModernAgencyService";
import ModernAgencyPricing from "@/components/price/ModernAgencyPricing";
import ModernAgencyBrand from "@/components/brand/ModernAgencyBrand";
import ModernAgencyAbout from "@/components/about/ModernAgencyAbout";
import ModernAgencyBlog from "@/components/blog/ModernAgencyBlog";
import ModernAgencyHero from "@/components/hero/ModernAgencyHero";
import ModernAgencyFaq from "@/components/faq/ModernAgencyFaq";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lawyer Agency - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <ModernAgencyHero />
            <ModernAgencyAbout />
            <ModernAgencyFunfact />
            <ModernAgencyService />
            <ModernAgencyProject />
            <ModernAgencyPricing />
            <ModernAgencyTestimonial />
            <ModernAgencyBrand />
            <ModernAgencyBlog />
            <ModernAgencyFaq />
        </main>
    );
};

export default page;