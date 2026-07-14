import BlogDetailsMain from "@/components/blog/BlogDetailsMain";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog Details - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <BlogDetailsMain id={1} />
        </main>

    );
};

export default page;