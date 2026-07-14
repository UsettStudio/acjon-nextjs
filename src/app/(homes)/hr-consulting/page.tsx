import HRConsultingTestimonial from "@/components/testimonial/HRConsultingTestimonial";
import HRConsultingPortfolio from "@/components/portfolio/HRConsultingPortfolio";
import HRConsultingChooseArea from "@/components/choose/HRConsultingChooseArea";
import HRConsultingHeaderTwo from "@/layouts/headers/HRConsultingHeaderTwo";
import HRConsultingService from "@/components/service/HRConsultingService";
import HRConsultingCtaArea from "@/components/cta/HRConsultingCtaArea";
import HRConsultingBrand from "@/components/brand/HRConsultingBrand";
import HRConsultingPrice from "@/components/price/HRConsultingPrice";
import HRConsultingAbout from "@/components/about/HRConsultingAbout";
import HRConsultingFooter from "@/layouts/footers/HRConsultingFooter";
import HRConsultingBlog from "@/components/blog/HRConsultingBlog";
import HRConsultingHero from "@/components/hero/HRConsultingHero";
import HRConsultingTeam from "@/components/team/HRConsultingTeam";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "HR Consulting - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <div className="hr-right-wrap">
                <div className="container-fluid p-0">
                    <div className="row gx-0">
                        <HRConsultingHeaderTwo />
                        <HRConsultingHero />
                        <div className="hr-right-box">
                            <div className="col-xl-10 offset-xl-2">
                                <div className="hr-border-wrap">
                                    <div className="row gx-0">
                                        <HRConsultingBrand />
                                        <HRConsultingAbout />
                                        <HRConsultingService />
                                        <HRConsultingPortfolio />
                                        <HRConsultingTeam />
                                        <HRConsultingChooseArea />
                                        <HRConsultingPrice />
                                        <HRConsultingTestimonial />
                                        <HRConsultingBlog />
                                        <HRConsultingCtaArea />
                                        <HRConsultingFooter />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default page;