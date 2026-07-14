"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import Link from "next/link";

type LoginFormInputs = {
    username: string;
    password: string;
    remember?: boolean;
};

const CheckoutLogin: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        mode: "onSubmit",
    });

    const onSubmit: SubmitHandler<LoginFormInputs> = () => {
        toast.success("Login successful!");
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Username */}
                <p className="form-row-first">
                    <label>
                        Username or email <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        {...register("username", {
                            required: "Username is required",
                            minLength: { value: 2, message: "Minimum 2 characters" },
                        })}
                    />
                    {errors.username && (
                        <span className="error-text">{errors.username.message}</span>
                    )}
                </p>

                {/* Password */}
                <p className="form-row-last">
                    <label>
                        Password <span className="required">*</span>
                    </label>
                    <input
                        type="password"
                        {...register("password", {
                            required: "Password is required",
                            minLength: { value: 6, message: "Minimum 6 characters" },
                        })}
                    />
                    {errors.password && (
                        <span className="error-text">{errors.password.message}</span>
                    )}
                </p>

                {/* Submit + Remember me */}
                <p className="form-row">
                    <button className="tp-btn" type="submit">Login</button>{" "}
                    <label>
                        <input type="checkbox" {...register("remember")} />{" "}
                        Remember me
                    </label>
                </p>

                {/* Lost password */}
                <p className="lost-password">
                    <Link href="#">Lost your password?</Link>
                </p>
            </form>
        </>
    );
};

export default CheckoutLogin;
