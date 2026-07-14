import CartItem from "@/components/shop/subComponents/CartItem";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Cart - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <section className="cart-area pt-200 pb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <form action="#">
                                <div className="table-content table-responsive">
                                    <div className="tp-continue-shopping">
                                        <p><Link href="/shop">Continue Shopping <i className="fal fa-reply"></i></Link></p>
                                    </div>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th className="product-thumbnail">Images</th>
                                                <th className="cart-product-name">Product</th>
                                                <th className="product-price">Unit Price</th>
                                                <th className="product-quantity">Quantity</th>
                                                <th className="product-subtotal">Total</th>
                                                <th className="product-remove">Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <CartItem />
                                        </tbody>
                                    </table>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                        <div className="coupon-all">
                                            <div className="coupon">
                                                <input id="coupon_code" className="input-text" name="coupon_code" defaultValue=""
                                                    placeholder="Coupon code" type="text" />
                                                <button className="tp-btn tp-btn-black" name="apply_coupon" type="submit">Apply
                                                    coupon</button>
                                            </div>
                                            <div className="coupon2">
                                                <button className="tp-btn tp-btn-black" name="update_cart" type="submit">Update cart</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row justify-content-end">
                                    <div className="col-md-5 mr-auto">
                                        <div className="cart-page-total">
                                            <h2>Cart totals</h2>
                                            <ul className="mb-20">
                                                <li>Subtotal <span>$250.00</span></li>
                                                <li>Total <span>$250.00</span></li>
                                            </ul>
                                            <Link className="tp-btn" href="/checkout">Proceed to checkout</Link>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default page;