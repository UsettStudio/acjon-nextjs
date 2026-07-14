"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { CloseEye, OpenEye } from "@/svg/AuthIcons";
import Image from "next/image";
import Link from "next/link";

type RegisterFormInputs = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
};

const RegisterForm = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<RegisterFormInputs>({
        mode: "onSubmit",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const password = watch("password");

    const onSubmit: SubmitHandler<RegisterFormInputs> = () => {
        toast.success("Registration successful!");
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="tp-login-option">
                {/* Social */}
                <div className="tp-login-social mb-10 d-flex flex-wrap align-items-center justify-content-center">
                    <div className="tp-login-option-item has-google">
                        <Link href="#">
                            <Image
                                width={22}
                                height={22}
                                src="/assets/img/shop/login/google.svg"
                                alt="Google"
                            />
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
                        or Sign up with <Link href="#">Email</Link>
                    </p>
                </div>

                <div className="tp-login-input-wrapper">
                    {/* Name */}
                    <div className="tp-login-input-box">
                        <div className="tp-login-input-title">
                            <label>Your Name</label>
                        </div>
                        <div className="tp-login-input">
                            <input
                                type="text"
                                placeholder="Your Name"
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: {
                                        value: 2,
                                        message: "Name must be at least 2 characters",
                                    },
                                })}
                            />
                        </div>
                        {errors.name && (
                            <p className="error-text">{errors.name.message}</p>
                        )}
                    </div>

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
                                className="tp-login-input-eye"
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

                    {/* Confirm Password */}
                    <div className="tp-login-input-box">
                        <div className="tp-login-input-title">
                            <label>Confirm Password</label>
                        </div>
                        <div className="tp-login-input p-relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter password"
                                {...register("confirmPassword", {
                                    required: "Confirm password is required",
                                    validate: (value) =>
                                        value === password || "Passwords do not match",
                                })}
                            />
                            <div
                                className="tp-login-input-eye"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                style={{ cursor: "pointer" }}
                            >
                                {showConfirmPassword ? <OpenEye /> : <CloseEye />}
                            </div>
                        </div>
                        {errors.confirmPassword && (
                            <p className="error-text">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Terms */}
                <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-20">
                    <div className="tp-login-remeber">
                        <input
                            type="checkbox"
                            {...register("acceptTerms", {
                                required: "You must accept the terms",
                            })}
                            id="terms"
                        />
                        <label htmlFor="terms">
                            I accept the terms of the Service & Privacy Policy.
                        </label>
                    </div>
                </div>
                {errors.acceptTerms && (
                    <p className="error-text">{errors.acceptTerms.message}</p>
                )}

                {/* Submit */}
                <div className="tp-login-bottom">
                    <button type="submit" className="tp-login-btn w-100">
                        Sign Up
                    </button>
                </div>
            </div>
        </form>
    );
};

export default RegisterForm;
