import CorporateAgencyPortfolio from "@/components/portfolio/CorporateAgencyPortfolio";
import CorporateATestimonial from "@/components/testimonial/CorporateATestimonial";
import CorporateAgencyService from "@/components/service/CorporateAgencyService";
import CorporateAgencyFunfact from "@/components/funfact/CorporateAgencyFunfact";
import CorporateAgencyChoose from "@/components/choose/CorporateAgencyChoose";
import CorporateAInstagram from "@/components/instagram/CorporateAInstagram";
import CorporateAgencyBrand from "@/components/brand/CorporateAgencyBrand";
import CorporateAgencyPrice from "@/components/price/CorporateAgencyPrice";
import CorporateAgencyAbout from "@/components/about/CorporateAgencyAbout";
import CorporateAgencyBlog from "@/components/blog/CorporateAgencyBlog";
import CorporateAgencyHero from "@/components/hero/CorporateAgencyHero";
import CorporateAgencyFaq from "@/components/faq/CorporateAgencyFaq";
import CommonBannerArea from "@/components/banner/CommonBannerArea";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Corporate Agency - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <CorporateAgencyHero />
            <CommonBannerArea wrapClass="cr-banner-area" subWrapClass="cr-banner-thumb"
                bannerThumb="/assets/img/corporate-agency/banner/banner-1.jpg"
            />
            <CorporateAgencyBrand />
            <CorporateAgencyAbout />
            <CorporateAgencyService />
            <CorporateAgencyChoose />
            <CorporateAgencyPortfolio />
            <CorporateAgencyPrice />
            <CorporateAgencyFaq />
            <CorporateAgencyFunfact />
            <CorporateATestimonial />
            <CorporateAgencyBlog />
            <CorporateAInstagram />
        </main>
    );
};

export default page;