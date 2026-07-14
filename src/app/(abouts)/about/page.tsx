import AboutBreadcrumb from "@/components/breadcrumb/AboutBreadcrumb";
import AboutServiceArea from "@/components/service/AboutServiceArea";
import AboutSectionArea from "@/components/about/AboutSectionArea";
import AboutBannerArea from "@/components/banner/AboutBannerArea";
import AboutFunfact from "@/components/funfact/AboutFunfact";
import AboutStepArea from "@/components/step/AboutStepArea";
import AboutTeam from "@/components/team/AboutTeam";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Business Consulting - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <AboutBreadcrumb />
            <AboutBannerArea />
            <AboutSectionArea />
            <AboutFunfact />
            <AboutServiceArea />
            <AboutTeam />
            <AboutStepArea />
        </main>
    );
};

export default page;