import BusinessConsultingPortfolio from "@/components/portfolio/BusinessConsultingPortfolio";
import BusinessConsultingFunfact from "@/components/funfact/BusinessConsultingFunfact";
import BusinessConsultingService from "@/components/service/BusinessConsultingService";
import BusinessConsultingPricing from "@/components/price/BusinessConsultingPricing";
import BusinessConsultingBanner from "@/components/banner/BusinessConsultingBanner";
import BusinessConsultingAbout from "@/components/about/BusinessConsultingAbout";
import BusinessCtestimonial from "@/components/testimonial/BusinessCtestimonial";
import BusinessConsultingVideo from "@/components/video/BusinessConsultingVideo";
import BusinessConsultingBrand from "@/components/brand/BusinessConsultingBrand";
import BusinessConsultingBlog from "@/components/blog/BusinessConsultingBlog";
import BusinessConsultingHero from "@/components/hero/BusinessConsultingHero";
import BusinessConsultingStep from "@/components/work/BusinessConsultingStep";
import BusinessConsultingFaq from "@/components/faq/BusinessConsultingFaq";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Business Consulting - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <BusinessConsultingHero />
            <BusinessConsultingBanner />
            <BusinessConsultingAbout />
            <BusinessConsultingService />
            <BusinessConsultingVideo />
            <BusinessConsultingPortfolio />
            <BusinessConsultingStep />
            <BusinessConsultingFunfact />
            <BusinessConsultingPricing />
            <BusinessCtestimonial />
            <BusinessConsultingFaq />
            <BusinessConsultingBlog />
            <BusinessConsultingBrand />
        </main>
    );
};

export default page;