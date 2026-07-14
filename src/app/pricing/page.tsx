import StartupAgencyBlog from "@/components/blog/StartupAgencyBlog";
import StartupAgencyFaq from "@/components/faq/StartupAgencyFaq";
import PricingArea from "@/components/price/PricingArea";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <PricingArea />
            <StartupAgencyFaq />
            <StartupAgencyBlog />
        </main>
    );
};

export default page;