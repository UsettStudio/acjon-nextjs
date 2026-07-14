"use client";
import RelatedProduct from '@/components/product/subComponents/RelatedProduct';
import ProductDetailsTabContent from '@/components/product/ProductDetailsTab';
import { CartIcon, CompareIcon, HeartIcon, MinusIcon } from '@/svg/ShopIcons';
import ShopBreadcrumb from '@/components/breadcrumb/ShopBreadcrumb';
import ShopCtaArea from '@/components/cta/ShopCtaArea';
import productData from '@/data/productData';
import { IdProps } from '@/types/custom-dt';
import { PlusIcon } from '@/svg';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ProductDetailsMain = ({ id }: IdProps) => {
    const [quantity, setQuantity] = useState(1);
    // Find the product based on the ID
    const product = productData.find((project) => project.id == id);

    const handleIncrease = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleDecrease = () => {
        setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    };

    return (
        <main>
            <ShopBreadcrumb category={product?.children || "Apple Watch"} productTitle={product?.title} />
            <section className="product__details-area pb-115">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-7 col-lg-6">
                            <div className="product__details-thumb-tab mr-70">
                                {/* Big Images */}
                                <div className="product__details-thumb-content w-img">
                                    <div className="tab-content" id="nav-tabContent">
                                        {product?.relatedImages.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`tab-pane fade ${index === 0 ? "show active" : ""}`}
                                                id={`nav-${index + 1}`}
                                                role="tabpanel"
                                                aria-labelledby={`nav-${index + 1}-tab`}
                                            >
                                                <Image
                                                    src={item.img}
                                                    alt={`Product image ${index + 1}`}
                                                    width={694}
                                                    height={659}
                                                    sizes="(max-width: 768px) 100vw, 694px"
                                                    priority
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Thumbnail Nav */}
                                <div className="product__details-thumb-nav tp-tab">
                                    <nav>
                                        <div
                                            className="nav nav-tabs justify-content-sm-between"
                                            id="nav-tab"
                                            role="tablist"
                                        >
                                            {product?.relatedImages.map((item, index) => (
                                                <button
                                                    key={index}
                                                    className={`nav-link ${index === 0 ? "active" : ""}`}
                                                    id={`nav-${index + 1}-tab`}
                                                    data-bs-toggle="tab"
                                                    data-bs-target={`#nav-${index + 1}`}
                                                    type="button"
                                                    role="tab"
                                                    aria-controls={`nav-${index + 1}`}
                                                    aria-selected={index === 0 ? "true" : "false"}
                                                >
                                                    <Image width={108} height={108} src={item.img} alt={`Thumbnail ${index + 1}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </nav>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-5 col-lg-6">
                            <div className="product__details-wrapper">

                                <div className="product__details-stock">
                                    {(product?.quantity ?? 0) > 0 ? (
                                        <span className="in-stock">
                                            {product?.quantity} In Stock
                                        </span>
                                    ) : (
                                        <span className="out-stock">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                                <h3 className="product__details-title">{product?.title}</h3>

                                <div className="product__details-rating d-flex align-items-center">
                                    <div className="product__rating product__rating-2 d-flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span key={star}>
                                                <i
                                                    className={`fa-solid ${(product?.reviews ?? 0) >= star
                                                        ? "fa-star"
                                                        : "fa-star fa-star-o"
                                                        }`}
                                                ></i>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="product__details-rating-count">
                                        <span>({product?.reviews} customer review)</span>
                                    </div>
                                </div>

                                <p>{product?.shortDesc}</p>

                                <div className="product__details-price">
                                    {/* Old price */}
                                    <span className="product__details-ammount old-ammount">
                                        ${product?.originalPrice}
                                    </span>{" "}

                                    {/* Current price */}
                                    <span className="product__details-ammount new-ammount">
                                        ${product?.price}
                                    </span>

                                    {/* Discount badge*/}
                                    {product && product.discount > 0 && (
                                        <span className="product__details-offer">
                                            -{product.discount}%
                                        </span>
                                    )}
                                </div>

                                <div className="product__details-quantity">
                                    <div className="tp-product-quantity mt-10 mb-10">
                                        <span className="tp-cart-minus" onClick={handleDecrease}>
                                            <MinusIcon />
                                        </span>

                                        <input
                                            className="tp-cart-input"
                                            type="text"
                                            value={quantity}
                                            readOnly
                                        />

                                        <span className="tp-cart-plus" onClick={handleIncrease}>
                                            <PlusIcon />
                                        </span>
                                    </div>
                                </div>

                                <div className="product__details-action d-flex flex-wrap align-items-center">
                                    <button type="button" className="product-add-cart-btn product-add-cart-btn-3">
                                        <CartIcon />
                                        Add to Cart
                                    </button>
                                    <button type="button" className="product-action-btn">
                                        <HeartIcon />
                                        <span className="product-action-tooltip">Add To Wishlist</span>
                                    </button>
                                    <button type="button" className="product-action-btn">
                                        <CompareIcon />
                                        <span className="product-action-tooltip">Add To Compare</span>
                                    </button>
                                </div>
                                <div className="product__details-sku product__details-more">
                                    <p>SKU:</p>{" "}
                                    <span>{product?.SKU}</span>
                                </div>
                                <div className="product__details-categories product__details-more">
                                    <p>Categories:</p>{" "}
                                    <span>
                                        <Link href="#">iPhone Cases,</Link>
                                    </span>
                                    <span>
                                        <Link href="#">Android Cases,</Link>
                                    </span>
                                    <span>
                                        <Link href="#">Accessories</Link>
                                    </span>
                                </div>
                                <div className="product__details-tags">
                                    <span>Tags:</span>{" "}
                                    {product?.tag?.map((item, index) => (
                                        <Link key={index} href="#">
                                            {item}
                                        </Link>
                                    ))}
                                </div>
                                <div className="product__details-share">
                                    <span>Share:</span>

                                    <Link href="#"><i className="fa-brands fa-facebook-f"></i></Link>
                                    <Link href="#"><i className="fa-brands fa-instagram"></i></Link>
                                    <Link href="#"><i className="fa-brands fa-linkedin-in"></i></Link>
                                    <Link href="#"><i className="fa-brands fa-youtube"></i></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <ProductDetailsTabContent />
            <RelatedProduct />
            <ShopCtaArea />
        </main>
    );
};

export default ProductDetailsMain;