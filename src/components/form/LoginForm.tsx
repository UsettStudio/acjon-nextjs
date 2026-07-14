"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { CloseEye, OpenEye } from "@/svg/AuthIcons";
import { toast } from "react-toastify";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type LoginFormInputs = {
    email: string;
    password: string;
    remember?: boolean;
};

const LoginForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LoginFormInputs>({
        mode: "onSubmit",
    });

    const [showPassword, setShowPassword] = useState(false);

    const onSubmit: SubmitHandler<LoginFormInputs> = () => {
        toast.success("Login successful!");
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="tp-login-option">
                {/* Social Login */}
                <div className="tp-login-social mb-10 d-flex flex-wrap align-items-center justify-content-center">
                    <div className="tp-login-option-item has-google">
                        <Link href="#">
                            <Image
                                width={22}
                                height={22}
                                src="/assets/img/shop/login/google.svg"
                                alt="Google"
                            />{" "}
                            Sign in with google
                        </Link>
                    </div>
                    <div className="tp-login-option-item">
                        <Link href="#">
                            <Image
                                width={22}
                                height={22}
                                src="/assets/img/shop/login/facebook.svg"
                                alt="Facebook"
                            />
                        </Link>
                    </div>
                    <div className="tp-login-option-item">
                        <Link href="#">
                            <Image
                                width={20}
                                height={24}
                                src="/assets/img/shop/login/apple.svg"
                                alt="Apple"
                            />
                        </Link>
                    </div>
                </div>

                <div className="tp-login-mail text-center mb-40">
                    <p>
                        or Sign in with <Link href="#">Email</Link>
                    </p>
                </div>

                {/* Inputs */}
                <div className="tp-login-input-wrapper">
                    {/* Email */}
                    <div className="tp-login-input-box">
                        <div className="tp-login-input-title">
                            <label>Your Email</label>
                        </div>
                        <div className="tp-login-input">
                            <input
                                type="email"
                                placeholder="acjon@mail.com"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Please enter a valid email",
                                    },
                                })}
                            />
                        </div>
                        {errors.email && (
                            <p className="error-text">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="tp-login-input-box">
                        <div className="tp-login-input-title">
                            <label>Password</label>
                        </div>
                        <div className="tp-login-input p-relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 6 characters"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                })}
                            />

                            <div
                                className="tp-login-input-eye password-show-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: "pointer" }}
                            >
                                {showPassword ? <OpenEye /> : <CloseEye />}
                            </div>
                        </div>
                        {errors.password && (
                            <p className="error-text">{errors.password.message}</p>
                        )}
                    </div>
                </div>

                {/* Remember + Forgot */}
                <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-30">
                    <div className="tp-login-remeber">
                        <input type="checkbox" {...register("remember")} id="remember" />
                        <label htmlFor="remember">Remember me</label>
                    </div>
                    <div className="tp-login-forgot">
                        <Link href="#">Forgot Password?</Link>
                    </div>
                </div>

                {/* Submit */}
                <div className="tp-login-bottom">
                    <button type="submit" className="tp-login-btn w-100">
                        Login
                    </button>
                </div>
            </div>
        </form>
    );
};

export default LoginForm;
