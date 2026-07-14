import { PaginationNextPrevIcon } from '@/svg/ArrowIcon';
import Link from 'next/link';

const ShopPagination = () => {
    return (
        <div className="tp-pagination tp-pagination-style-2">
            <nav>
                <ul>
                    <li>
                        <Link href="/shop" className="tp-pagination-prev prev page-numbers">
                            <PaginationNextPrevIcon direction="left" />{" "}
                            Prev
                        </Link>
                    </li>
                    <li>
                        <Link href="/shop">1</Link>
                    </li>
                    <li>
                        <span className="current">2</span>
                    </li>
                    <li>
                        <Link href="/shop">3</Link>
                    </li>
                    <li>
                        <Link href="/shop" className="next page-numbers">
                            Next {" "}
                            <PaginationNextPrevIcon direction="right" />
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default ShopPagination;