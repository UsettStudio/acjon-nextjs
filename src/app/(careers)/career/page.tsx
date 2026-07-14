import CareerBreadcrumb from "@/components/breadcrumb/CareerBreadcrumb";
import CareerBenefitArea from "@/components/benefit/CareerBenefitArea";
import CareerBannerArea from "@/components/banner/CareerBannerArea";
import CareerValueArea from "@/components/career/CareerValueArea";
import CareerGrowArea from "@/components/career/CareerGrowArea";
import CareerFunfact from "@/components/funfact/CareerFunfact";
import CareerGallary from "@/components/career/CareerGallary";
import CareerBanner from "@/components/banner/CareerBanner";
import CareerAward from "@/components/award/CareerAward";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Career - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <CareerBreadcrumb />
            <CareerBannerArea />
            <CareerBenefitArea />
            <CareerGallary />
            <CareerAward />
            <CareerValueArea />
            <CareerFunfact />
            <CareerBanner />
            <CareerGrowArea />
        </main>
    );
};

export default page;