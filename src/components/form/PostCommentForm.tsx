"use client";
import { ButtonArrowIcon } from "@/svg";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

/* ---------- Types ---------- */
type CommentFormData = {
    name: string;
    email: string;
    website?: string;
    comment: string;
};

const PostCommentForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CommentFormData>();


    const onSubmit = async () => {
        // Replace this with real API call
        // await fetch("/api/comment", { method: "POST", body: JSON.stringify(data) });
        toast.success("Submitted successfully");
        reset();
    };

    return (
        <div className="postbox-details-form-inner">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                    {/* Name */}
                    <div className="col-xl-6">
                        <div className="postbox-details-input-box">
                            <div className="postbox-details-input">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    {...register("name", {
                                        required: "Name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Minimum 2 characters required",
                                        },
                                    })}
                                />
                                {errors.name && (
                                    <span className="error-text">{errors.name.message}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="col-xl-6">
                        <div className="postbox-details-input-box">
                            <div className="postbox-details-input">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^\S+@\S+$/i,
                                            message: "Enter a valid email address",
                                        },
                                    })}
                                />
                                {errors.email && (
                                    <span className="error-text">{errors.email.message}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Website */}
                    <div className="col-xl-12">
                        <div className="postbox-details-input-box">
                            <div className="postbox-details-input">
                                <label>Website</label>
                                <input
                                    type="text"
                                    {...register("website", {
                                        pattern: {
                                            value:
                                                /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
                                            message: "Enter a valid website URL",
                                        },
                                    })}
                                />
                                {errors.website && (
                                    <span className="error-text">{errors.website.message}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="col-xl-12">
                        <div className="postbox-details-input-box">
                            <div className="postbox-details-input">
                                <label>Comment *</label>
                                <textarea
                                    id="msg"
                                    {...register("comment", {
                                        required: "Comment is required",
                                        minLength: {
                                            value: 10,
                                            message: "Minimum 10 characters required",
                                        },
                                    })}
                                />
                                {errors.comment && (
                                    <span className="error-text">{errors.comment.message}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="postbox-details-suggetions mb-30">
                    <div className="postbox-details-remeber">
                        <input id="remeber" type="checkbox" />
                        <label htmlFor="remeber">Save my name, email, and website in this browser for the next time I comment.</label>
                    </div>
                </div>
                <div className="postbox-details-input-box">
                    <button type="submit" className="tp-btn-green tp-btn-anim">
                        <span className="tp-btn-text">Post Comment</span>
                        <span><ButtonArrowIcon /></span>
                    </button>
                </div>
            </form>
        </div>

    );
};

export default PostCommentForm;
