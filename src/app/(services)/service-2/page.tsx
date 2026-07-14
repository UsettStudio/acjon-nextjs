
import ServiceTwoTextSlider from "@/components/text-slider/ServiceTwoTextSlider";
import ServiceTwoBreadcrumb from "@/components/breadcrumb/ServiceTwoBreadcrumb";
import ServiceTwoService from "@/components/service/ServiceTwoService";
import ServiceTwoBanner from "@/components/banner/ServiceTwoBanner";
import ServiceTwoBrand from "@/components/brand/ServiceTwoBrand";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Service 2 - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <ServiceTwoBreadcrumb />
            <ServiceTwoService />
            <ServiceTwoBanner />
            <ServiceTwoBrand />
            <ServiceTwoTextSlider />
        </main>
    );
};

export default page;