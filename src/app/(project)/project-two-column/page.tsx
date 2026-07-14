import ProjectAreaTwoColumn from "@/components/project/ProjectAreaTwoColumn";
import ProjectBreadcrumb from "@/components/breadcrumb/ProjectBreadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Project Two Column - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <ProjectBreadcrumb />
            <ProjectAreaTwoColumn />
        </main>
    );
};

export default page;