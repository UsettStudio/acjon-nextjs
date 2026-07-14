
import TeamDetailsMain from "@/components/team/TeamDetailsMain";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Team Details - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <TeamDetailsMain id={1} />
    );
};

export default page;