
import CreativeATextSlideTwo from "@/components/text-slider/CreativeATextSlideTwo";
import CreativeAgencyAward from "@/components/award/CreativeAgencyAward";
import TeamMembers from "@/components/team/subComponents/TeamMembers";
import TeamTestimonial from "@/components/testimonial/TeamTestimonial";
import TeamHero from "@/components/hero/TeamHero";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Team - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <TeamHero />
            <TeamMembers />
            <TeamTestimonial />
            <CreativeATextSlideTwo customCls='tp-about-inner-text' />
            <CreativeAgencyAward customCls='tp-about-inner-award' spacingCustomCls='pt-130 pb-160' />
        </main>
    );
};

export default page;