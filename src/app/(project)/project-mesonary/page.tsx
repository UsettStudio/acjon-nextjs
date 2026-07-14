import ProjectMesonary from "@/components/project/ProjectMesonary";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Project Mesonary - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <ProjectMesonary />
        </main>
    );
};

export default page;