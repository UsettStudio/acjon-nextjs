import BusinessConsultingService from "@/components/service/BusinessConsultingService";
import CreativeATextSlideTwo from "@/components/text-slider/CreativeATextSlideTwo";
import CorporateAInstagram from "@/components/instagram/CorporateAInstagram";
import AboutUsTestimonial from "@/components/testimonial/AboutUsTestimonial";
import AboutUsBreadcrumb from "@/components/breadcrumb/AboutUsBreadcrumb";
import CreativeAgencyAward from "@/components/award/CreativeAgencyAward";
import AboutUsBrand from "@/components/brand/AboutUsBrand";
import AboutUsAbout from "@/components/about/AboutUsAbout";
import HomeFunfact from "@/components/funfact/HomeFunfact";
import AboutUsFaq from "@/components/faq/AboutUsFaq";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us Business Consulting - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <AboutUsBreadcrumb />
            <AboutUsBrand />
            <AboutUsAbout />
            <HomeFunfact />
            <BusinessConsultingService spacingCustomCls='pb-120' />
            <AboutUsFaq />
            <AboutUsTestimonial />
            <CreativeATextSlideTwo customCls='tp-about-inner-text' />
            <CreativeAgencyAward customCls='tp-about-inner-award' spacingCustomCls='pt-100 pb-150' />
            <CorporateAInstagram />
        </main>
    );
};

export default page;