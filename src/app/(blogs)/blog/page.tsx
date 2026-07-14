import BlogBreadcrumbStyleOne from "@/components/breadcrumb/BlogBreadcrumbStyleOne";
import BlogSingleItem from "@/components/blog/subComponents/BlogSingleItem";
import BlogPagination from "@/components/common/pagination/BlogPagination";
import blogData from "@/data/blogData";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog - Digital Agency & Creative Portfolio",
};

const page = () => {
    const displayBlogData = blogData.slice(31, 37);
    return (
        <main>
            <BlogBreadcrumbStyleOne />
            <div className="cr-blog-area cr-blog-style cr-blog-inner-style pt-160 pb-160">
                <div className="container container-1510">
                    <div className="row">
                        {displayBlogData.map((item) => (
                            <BlogSingleItem key={item.id} item={item} />
                        ))}
                        <div className="col-12">
                            <BlogPagination />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default page;