import ProjectSliderArea from "@/components/project/ProjectSliderArea";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Project Slider - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <ProjectSliderArea />
        </main>
    );
};

export default page;