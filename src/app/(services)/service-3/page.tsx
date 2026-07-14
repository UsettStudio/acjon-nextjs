import ServiceThreeTestimonial from "@/components/testimonial/ServiceThreeTestimonial";
import CreativeATextSlideTwo from "@/components/text-slider/CreativeATextSlideTwo";
import CreativeAgencyAward from "@/components/award/CreativeAgencyAward";
import ServiceThreeHero from "@/components/hero/ServiceThreeHero";
import ServiceThree from "@/components/service/ServiceThree";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Service 3 - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <ServiceThreeHero />
            <ServiceThree />
            <ServiceThreeTestimonial />
            <CreativeATextSlideTwo customCls='tp-about-inner-text' />
            <CreativeAgencyAward customCls='tp-about-inner-award' spacingCustomCls='pt-130 pb-160' />
        </main>
    );
};

export default page;