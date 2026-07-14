import { ArrowIconSeventeen } from "@/svg/ArrowIcon";
import Link from "next/link";

const ShopBanner = () => {
    return (
        <section className="banner__area">
            <div className="container">
                <div className="banner__inner include-bg" style={{ backgroundImage: `url(assets/img/shop/banner/banner-1.jpg)` }}>
                    <div className="row">
                        <div className="col-xl-5 col-lg-6 col-md-8">
                            <div className="banner__content">
                                <span>Apple iPhone 16 Pro</span>
                                <h3 className="banner__title">
                                    <Link href="/product-details">The wait is on: <br /> iphone 16 pro</Link>
                                </h3>
                                <p>Last call for up to <span>32%</span> off! </p>

                                <div className="banner__btn">
                                    <Link href="/product-details" className="tp-btn">
                                        Buy Now {" "}
                                        <ArrowIconSeventeen />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopBanner;