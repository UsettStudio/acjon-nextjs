import BlogSidebarPagination from "@/components/common/pagination/BlogSidebarPagination";
import BlogBreadcrumbStyleFour from "@/components/breadcrumb/BlogBreadcrumbStyleFour";
import BlogSidebarTwoPostboxItem from "@/components/blog/BlogSidebarTwoPostboxItem";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog Sidebar-2 - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <BlogBreadcrumbStyleFour />
            {/* blog-sidebar-area */}
            <div className="tp-blog-sidebar-area cr-blog-inner-style pt-160 pb-120">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-xl-8 col-lg-7">
                            <div className="postbox-wrapper mb-40">
                                {/* blog post */}
                                <BlogSidebarTwoPostboxItem />
                                {/* pagination */}
                                <BlogSidebarPagination
                                    currentPage={2}
                                    totalPages={5}
                                    baseUrl="/blog-sidebar-2"
                                />
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