"use client";

import { useState } from "react";
import CheckoutLogin from "../form/CheckoutLogin";
import ApplyCoupon from "../form/ApplyCoupon";

const CouponArea = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showCoupon, setShowCoupon] = useState(false);

    return (
        <section className="coupon-area pt-200 pb-30">
            <div className="container">
                <div className="row">
                    {/* Returning Customer / Login */}
                    <div className="col-md-6">
                        <div className="coupon-accordion">
                            <h3>
                                Returning customer?{" "}
                                <span
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setShowLogin((prev) => !prev)}
                                >
                                    Click here to login
                                </span>
                            </h3>

                            <div
                                id="checkout-login"
                                className="coupon-content"
                                style={{
                                    display: showLogin ? "block" : "none",
                                }}
                            >
                                <div className="coupon-info">
                                    <p className="coupon-text">
                                        Quisque gravida turpis sit amet nulla posuere lacinia. Cras
                                        sed est sit amet ipsum luctus.
                                    </p>
                                    <CheckoutLogin />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Have a Coupon */}
                    <div className="col-md-6">
                        <div className="coupon-accordion">
                            <h3>
                                Have a coupon?{" "}
                                <span
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setShowCoupon((prev) => !prev)}
                                >
                                    Click here to enter your code
                                </span>
                            </h3>

                            <div
                                id="checkout_coupon"
                                className="coupon-checkout-content"
                                style={{
                                    display: showCoupon ? "block" : "none",
                                }}
                            >
                                <div className="coupon-info">
                                    <ApplyCoupon />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CouponArea;
