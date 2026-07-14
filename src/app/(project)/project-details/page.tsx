import ProjectDetailsMain from "@/components/project/ProjectDetailsMain";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Project details - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <ProjectDetailsMain id={1} />
        </main>
    );
};

export default page;