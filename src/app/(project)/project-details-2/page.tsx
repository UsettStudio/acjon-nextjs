

import ProjectDetailsTwoMain from "@/components/project/ProjectDetailsTwoMain";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Project details 2 - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <ProjectDetailsTwoMain id={5} />
    );
};

export default page;