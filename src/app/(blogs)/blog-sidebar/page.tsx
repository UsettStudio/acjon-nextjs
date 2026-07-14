import BlogBreadcrumbStyleThree from "@/components/breadcrumb/BlogBreadcrumbStyleThree";
import BlogPagination from "@/components/common/pagination/BlogPagination";
import HomeBlogItem from "@/components/blog/subComponents/HomeBlogItem";
import BlogSidebar from "@/components/blog/BlogSidebar";
import blogData from "@/data/blogData";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog Sidebar - Digital Agency & Creative Portfolio",
};

const page = () => {
    //display blog data
    const displayBlogData = blogData.slice(49, 57);

    return (
        <main>
            <BlogBreadcrumbStyleThree />
            {/* blog-sidebar-area */}
            <div className="tp-blog-sidebar-area cr-blog-inner-style pt-160 pb-120">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-xl-8 col-lg-7">
                            <div className="tp-blog-sidebar-left-wrap mb-40">
                                <div className="row">
                                    {displayBlogData.map((item, index) => (
                                        <div key={index} className='col-xl-6'>
                                            <HomeBlogItem blog={item} />
                                        </div>
                                    ))}
                                    <div className="col-12">
                                        <BlogPagination url="/blog-sidebar" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-5">
                            <BlogSidebar />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default page;