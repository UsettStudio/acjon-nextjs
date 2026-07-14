import { Metadata } from "next";
import SkewSliderClient from "./SkewSliderClient";

export const metadata: Metadata = {
    title: "Project Skew Slider - Digital Agency & Creative Portfolio",
};

const Page = () => {
    return <SkewSliderClient />;
};

export default Page;
