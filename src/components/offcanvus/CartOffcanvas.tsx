"use client";
import SingleCartItem from "../product/subComponents/SingleCartItem";
import productData from "@/data/productData";
import Link from "next/link";
import Image from "next/image";

export interface cartOffcanvasIProps {
    openCartOffcanvas: boolean;
    setOpenCartOffcanvas: React.Dispatch<React.SetStateAction<boolean>>;
};

const CartOffcanvas: React.FC<cartOffcanvasIProps> = ({ openCartOffcanvas, setOpenCartOffcanvas }) => {
    // demo products (slice)
    const cart_items = productData.slice(36, 39);

    // Convert price (string) → number & calculate subtotal
    const subtotal = cart_items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    return (
        <>
            <div className={`cartmini__area ${openCartOffcanvas ? "cartmini-opened" : ""}`}>
                <div className="cartmini__wrapper d-flex justify-content-between flex-column">

                    {/* TOP */}
                    <div className="cartmini__top-wrapper">
                        <div className="cartmini__top p-relative">
                            <div className="cartmini__top-title">
                                <h4>Shopping cart</h4>
                            </div>
                            <div className="cartmini__close">
                                <button
                                    onClick={() => setOpenCartOffcanvas(false)}
                                    type="button"
                                    className="cartmini__close-btn cartmini-close-btn"
                                >
                                    <i className="fal fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div className="cartmini__widget">
                            {cart_items && cart_items.length > 0 ? (
                                cart_items.map((item, i) => (
                                    <SingleCartItem key={i} {...item} />
                                ))
                            ) : (
                                <div className="cartmini__empty text-center">
                                    <Image width={283} height={171} src={"/assets/img/shop/product/cartmini/empty-cart.png"} alt="empty cart" />
                                    <p>Your Cart is empty</p>
                                    <Link href="/shop" className="tp-btn">
                                        Go to Shop
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CHECKOUT */}
                    <div className="cartmini__checkout">
                        <div className="cartmini__checkout-title mb-30">
                            <h4>Subtotal:</h4>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>

                        <div className="cartmini__checkout-btn">
                            <Link href="/cart" className="tp-btn-border text-center mb-10 w-100">
                                <span></span> view cart
                            </Link>
                            <Link href="/checkout" className="tp-btn-border border-none text-center w-100">
                                <span></span> checkout
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* OVERLAY */}
            <div
                onClick={() => setOpenCartOffcanvas(false)}
                className={`body-overlay ${openCartOffcanvas ? "opened" : ""}`}
            ></div>
        </>
    );
};

export default CartOffcanvas;
