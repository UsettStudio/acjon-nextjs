import { Metadata } from "next";
import PortfolioWebglShowcaseClient from "./PortfolioWebglShowcaseClient";

export const metadata: Metadata = {
    title: "Portfolio Webgl Showcase - Digital Agency & Creative Portfolio",
};

const Page = () => {
    return <PortfolioWebglShowcaseClient />;
};

export default Page;
