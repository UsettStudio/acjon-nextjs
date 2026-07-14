import { Metadata } from "next";
import PortfolioCreativelClient from "./PortfolioCreativelClient"

export const metadata: Metadata = {
    title: "Portfolio Creative Thumb - Digital Agency & Creative Portfolio",
};

const Page = () => {
    return <PortfolioCreativelClient />;
};

export default Page;
