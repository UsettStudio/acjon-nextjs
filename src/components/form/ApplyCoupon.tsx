"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import React from "react";

type CouponFormInputs = {
    coupon: string;
};

const ApplyCoupon: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CouponFormInputs>({
        mode: "onSubmit",
    });

    const onSubmit: SubmitHandler<CouponFormInputs> = (data) => {
        toast.success(`Coupon "${data.coupon}" applied successfully!`);
        reset();
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <p className="checkout-coupon">
                    <input
                        type="text"
                        placeholder="Coupon Code"
                        {...register("coupon", {
                            required: "Please enter a coupon code",
                        })}
                    />
                    {errors.coupon && (
                        <span className="error-text">{errors.coupon.message}</span>
                    )}
                    <br />
                    <button className="tp-btn" type="submit">
                        Apply Coupon
                    </button>
                </p>

            </form>
        </>
    );
};

export default ApplyCoupon;
