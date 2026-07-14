import { Metadata } from "next";
import PersonalPortfolioClient from "./PersonalPortfolioClient";

export const metadata: Metadata = {
    title: "Personal Portfolio - Digital Agency & Creative Portfolio",
};

const page = () => {
    return <PersonalPortfolioClient />;
};

export default page;
