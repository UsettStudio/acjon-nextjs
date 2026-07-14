import { HomeIcon } from "@/svg/ShopIcons";
import Link from "next/link";

const ShopBreadcrumb = ({ category = "", productTitle = "" }) => {
    return (
        <section className="breadcrumb__area pt-120 pb-55 include-bg">
            <div className="container">
                <div className="row">
                    <div className="col-xxl-7">
                        <div className="breadcrumb__content p-relative z-index-1">
                            <div className="breadcrumb__list has-icon">
                                <span className="breadcrumb-icon">
                                    <HomeIcon />
                                </span>
                                <span><Link href="/">Home</Link></span>
                                <span className="dvdr"><i className="fa-regular fa-angle-right"></i></span>
                                <span>Products</span>
                                {
                                    category && (
                                        <>
                                            <span className="dvdr"><i className="fa-regular fa-angle-right"></i></span>
                                            <span>{category}</span>
                                        </>
                                    )
                                }
                                {
                                    productTitle && (
                                        <>
                                            <span className="dvdr"><i className="fa-regular fa-angle-right"></i></span>
                                            <span>{productTitle}</span>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopBreadcrumb;