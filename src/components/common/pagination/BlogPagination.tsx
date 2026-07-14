import Link from "next/link";

type BlogPaginationProps = {
    totalPages?: number;
    currentPage?: number;
    url?: string;
};

const BlogPagination = ({
    totalPages = 3,
    currentPage = 1,
    url = "/blog",
}: BlogPaginationProps) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="tp-pagenation-wrap pt-10">
            <ul>
                {/* Prev */}
                <li className={currentPage === 1 ? "disabled" : ""}>
                    <Link href={`${url}?page=${currentPage - 1}`}>
                        <i className="fa-solid fa-arrow-left" />
                    </Link>
                </li>

                {/* Page numbers */}
                {pages.map((page) => (
                    <li key={page} className={currentPage === page ? "active" : ""}>
                        <Link href={`${url}?page=${page}`}>{page}</Link>
                    </li>
                ))}

                {/* Next */}
                <li className={currentPage === totalPages ? "disabled" : ""}>
                    <Link href={`${url}?page=${currentPage + 1}`}>
                        <i className="fa-solid fa-arrow-right" />
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default BlogPagination;
