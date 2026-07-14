import DigitalMBlogItem from "@/components/blog/subComponents/DigitalMBlogItem";
import BlogBreadcrumbStyleTwo from "@/components/breadcrumb/BlogBreadcrumbStyleTwo";
import BlogPagination from "@/components/common/pagination/BlogPagination";
import blogData from "@/data/blogData";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog-2 - Digital Agency & Creative Portfolio",
};

const BLOG_TABS = [
    { id: 'all', label: 'all', active: true },
    { id: 'design', label: 'design' },
    { id: 'development', label: 'development' },
    { id: 'marketing', label: 'marketing' },
    { id: 'other', label: 'other' },
];

const page = () => {
    const displayBlogData = blogData.slice(40, 49);

    const renderBlogItems = () => (
        <div className="row gx-30">
            {displayBlogData.map((blog, index) => (
                <DigitalMBlogItem {...blog} key={index} />
            ))}
        </div>
    );
    return (
        <main>
            <BlogBreadcrumbStyleTwo />

            {/* Blog Area */}
            <div className="tp-blog-area tp-blog-tab-spacing pb-160">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-12">
                            {/* Tabs */}
                            <div className="tp-blog-tab-wrap mb-50">
                                <nav>
                                    <div className="nav-tabs" role="tablist">
                                        {BLOG_TABS.map(tab => (
                                            <button
                                                key={tab.id}
                                                className={`nav-link ${tab.active ? 'active' : ''}`}
                                                id={`nav-${tab.id}-tab`}
                                                data-bs-toggle="tab"
                                                data-bs-target={`#nav-${tab.id}`}
                                                type="button"
                                                role="tab"
                                                aria-selected={tab.active || false}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </nav>
                            </div>

                            {/* Tab Contents */}
                            <div className="tp-blog-tab-item">
                                <div className="tab-content">
                                    {BLOG_TABS.map(tab => (
                                        <div
                                            key={tab.id}
                                            className={`tab-pane fade ${tab.active ? 'show active' : ''}`}
                                            id={`nav-${tab.id}`}
                                            role="tabpanel"
                                        >
                                            {renderBlogItems()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
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