import BlogDetailsTwoMain from "@/components/blog/BlogDetailsTwoMain";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog Details-2 - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <BlogDetailsTwoMain id={1} />
        </main>
    );
};

export default page;