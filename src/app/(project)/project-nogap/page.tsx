import ProjectBreadcrumb from "@/components/breadcrumb/ProjectBreadcrumb";
import ProjectNoGapArea from "@/components/project/ProjectNoGapArea";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Project nogap - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <ProjectBreadcrumb />
            <ProjectNoGapArea />
        </main>
    );
};

export default page;