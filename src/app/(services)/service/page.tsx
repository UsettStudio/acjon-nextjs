
import ServiceBreadcrumb from "@/components/breadcrumb/ServiceBreadcrumb";
import ModernAgencyPricing from "@/components/price/ModernAgencyPricing";
import ServiceBannerTwo from "@/components/banner/ServiceBannerTwo";
import ServiceSection from "@/components/service/ServiceSection";
import ServiceBanner from "@/components/banner/ServiceBanner";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Service - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <ServiceBreadcrumb />
            <ServiceBanner />
            <ServiceSection />
            <ServiceBannerTwo />
            <ModernAgencyPricing sectionPaddingClass="pb-130 pt-150" titleClass='tp-text-revel' />
        </main>
    );
};

export default page;