import ProjectBreadcrumb from "@/components/breadcrumb/ProjectBreadcrumb";
import ProjectListAward from "@/components/award/ProjectListAward";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Project List - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <ProjectBreadcrumb />
            <ProjectListAward />
        </main>
    );
};

export default page;