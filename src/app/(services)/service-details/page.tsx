import ServiceDetailsMain from "@/components/service/ServiceDetailsMain";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Service Details - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <ServiceDetailsMain id={1} />
    );
};

export default page;