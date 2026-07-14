import Link from "next/link";

type BlogSidebarPaginationProps = {
    currentPage?: number;
    totalPages?: number;
    baseUrl?: string;
};

const BlogSidebarPagination = ({
    currentPage = 1,
    totalPages = 3,
    baseUrl = "/blog-sidebar-2",
}: BlogSidebarPaginationProps) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="tp-pagenation-wrap">
            <ul className="justify-content-start">
                {/* Prev */}
                <li className={currentPage === 1 ? "disabled" : ""}>
                    <Link href={`${baseUrl}?page=${currentPage - 1}`}>
                        <i className="fa-solid fa-arrow-left" />
                    </Link>
                </li>

                {/* Pages */}
                {pages.map((page) => (
                    <li key={page} className={page === currentPage ? "active" : ""}>
                        <Link href={`${baseUrl}?page=${page}`}>{page}</Link>
                    </li>
                ))}

                {/* Next */}
                <li className={currentPage === totalPages ? "disabled" : ""}>
                    <Link href={`${baseUrl}?page=${currentPage + 1}`}>
                        <i className="fa-solid fa-arrow-right" />
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default BlogSidebarPagination;
