import ProjectBreadcrumb from "@/components/breadcrumb/ProjectBreadcrumb";
import ProjectFullArea from "@/components/project/ProjectFullArea";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Project Full - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <ProjectBreadcrumb />
            <ProjectFullArea />
        </main>
    );
};

export default page;