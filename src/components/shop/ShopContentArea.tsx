import SingleProduct from "../product/subComponents/SingleProduct";
import { ShopShortSelect } from "./subComponents/ShopShortSelect";
import ShopPagination from "../common/pagination/ShopPagination";
import ShopVariantColor from "./subComponents/ShopVariantColor";
import ShopCategories from "./subComponents/ShopCategories";
import ShopModel from "./subComponents/ShopModel";
import ShopPrice from "./subComponents/ShopPrice";
import productData from "@/data/productData";

const ShopContentArea = () => {
    // display product items
    const displayProductItems = productData.slice(0, 9);

    return (
        <section className="shop__area pb-60">
            <div className="container">
                <div className="shop__top mb-50">
                    <div className="row align-items-center">
                        <div className="col-lg-6 col-md-5">
                            <div className="shop__result">
                                <p>Showing 1–12 of 16 results</p>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-7">
                            <div className="shop__sort d-flex justify-content-md-end">
                                <ShopShortSelect />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="shop__main">
                    <div className="row">
                        <div className="col-lg-3">
                            {/* sidebar area start   */}
                            <div className="shop__sidebar on-left">
                                <div className="shop__widget tp-accordion">
                                    <div className="accordion" id="shop_category">
                                        <ShopCategories />
                                    </div>
                                </div>
                                <div className="shop__widget tp-accordion">
                                    <div className="accordion" id="shop_model">
                                        <ShopModel />
                                    </div>
                                </div>
                                <div className="shop__widget tp-accordion">
                                    <div className="accordion" id="shop_color">
                                        <ShopVariantColor />
                                    </div>
                                </div>
                                <div className="shop__widget tp-accordion">
                                    <div className="accordion" id="shop_price">
                                        <ShopPrice />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-9 order-first order-lg-last">
                            <div className="shop__tab-content mb-40">
                                <div className="row">
                                    {/* product items start */}
                                    {displayProductItems.map((product) => (
                                        <div key={product.id} className="col-xl-4 col-lg-4 col-md-4 col-sm-6">
                                            <SingleProduct product={product} />
                                        </div>
                                    ))}
                                </div>
                                {/* pagination */}
                                <div className="row">
                                    <div className="col-xxl-12">
                                        <ShopPagination />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopContentArea;