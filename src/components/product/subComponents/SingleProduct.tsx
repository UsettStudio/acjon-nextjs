import { CartIcon, CompareIcon, EyeIcon, HeartIcon } from "@/svg/ShopIcons";
import { RatingFull, RatingHalf } from "./rating";
import { ProductDt } from "@/types/product-dt";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface productPropsDt {
    product: ProductDt
}

const SingleProduct: React.FC<productPropsDt> = ({ product }) => {
    const { id, image, title, price, badge } = product || {};

    return (
        <React.Fragment>
            <div className="product__item p-relative transition-3 mb-50">
                <div className="product__thumb w-img p-relative fix">
                    <Link href={`/product-details/${id}`}>
                        <Image
                            style={{width:"auto", height:"auto"}}
                            src={image}
                            alt="product image"
                            width={314}
                            height={372}
                            priority
                        />
                    </Link>

                    {badge && (
                        <div className="product__badge d-flex flex-column flex-wrap">
                            <span className={`product__badge-item ${badge === "new" ? "has-new" : ""}`}>
                                {badge}
                            </span>
                        </div>
                    )}

                    <div className="product__action d-flex flex-column flex-wrap">
                        <button type="button" className="product-action-btn">
                            <HeartIcon />
                            <span className="product-action-tooltip">Add To Wishlist</span>
                        </button>
                        <button type="button" className="product-action-btn" >
                            <EyeIcon />
                            <span className="product-action-tooltip">Quick view</span>
                        </button>

                        <button type="button" className="product-action-btn">
                            <CompareIcon />
                            <span className="product-action-tooltip">Add To Compare</span>
                        </button>
                    </div>
                    <div className="product__add transition-3">
                        <button type="button" className="product-add-cart-btn w-100">
                            <CartIcon />
                            Add to Cart
                        </button>
                    </div>
                </div>
                <div className="product__content">
                    <div className="product__rating d-flex">
                        <RatingFull />
                        <RatingFull />
                        <RatingFull />
                        <RatingFull />
                        <RatingHalf />
                    </div>
                    <h3 className="product__title">
                        <Link href={`/product-details/${id}`}>{title}</Link>
                    </h3>
                    <div className="product__price">
                        <span className="product__ammount">${price}</span>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default SingleProduct;
