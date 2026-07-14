"use client";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ButtonArrowIcon } from "@/svg";

interface JobApplicationFormValues {
    name: string;
    email: string;
    motivation: string;
    project: string;
    portfolio: string;
    salary: string;
    cv: FileList;
}

const JobApplicationForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<JobApplicationFormValues>();

    const onSubmit = async () => {
        // Replace this with real API call
        // await fetch("/api/application", { method: "POST", body: JSON.stringify(data) });
        toast.success("Application submitted successfully");
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="row">
                {/* Name */}
                <div className="col-lg-6">
                    <div className="tp-application-form-input mb-25">
                        <label className="tp-label">Your Name *</label>
                        <input
                            className="tp-input"
                            type="text"
                            {...register("name", { required: "Name is required" })}
                        />
                        {errors.name && (
                            <small className="text-danger">{errors.name.message}</small>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="col-lg-6">
                    <div className="tp-application-form-input mb-25">
                        <label className="tp-label">Your Email Address *</label>
                        <input
                            className="tp-input"
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter a valid email address",
                                },
                            })}
                        />
                        {errors.email && (
                            <small className="text-danger">{errors.email.message}</small>
                        )}
                    </div>
                </div>

                {/* Motivation */}
                <div className="col-lg-12">
                    <div className="tp-application-form-input mb-25">
                        <label className="tp-label">
                            Why you decided to apply here? *
                        </label>
                        <textarea
                            className="tp-input tp-textarea"
                            {...register("motivation", {
                                required: "This field is required",
                            })}
                        />
                        {errors.motivation && (
                            <small className="text-danger">
                                {errors.motivation.message}
                            </small>
                        )}
                    </div>
                </div>

                {/* Project */}
                <div className="col-lg-12">
                    <div className="tp-application-form-input mb-25">
                        <label className="tp-label">
                            Project you are proud of *
                        </label>
                        <textarea
                            className="tp-input tp-textarea"
                            {...register("project", {
                                required: "This field is required",
                            })}
                        />
                        {errors.project && (
                            <small className="text-danger">{errors.project.message}</small>
                        )}
                    </div>
                </div>

                {/* Portfolio */}
                <div className="col-lg-12">
                    <div className="tp-application-form-input mb-25">
                        <label className="tp-label">
                            Share your portfolio *
                        </label>
                        <textarea
                            className="tp-input tp-textarea"
                            {...register("portfolio", {
                                required: "Portfolio link is required",
                            })}
                        />
                        {errors.portfolio && (
                            <small className="text-danger">
                                {errors.portfolio.message}
                            </small>
                        )}
                    </div>
                </div>

                {/* Salary */}
                <div className="col-lg-12">
                    <div className="tp-application-form-input mb-25">
                        <label className="tp-label">
                            Current salary & expectations *
                        </label>
                        <textarea
                            className="tp-input tp-textarea"
                            {...register("salary", {
                                required: "Salary information is required",
                            })}
                        />
                        {errors.salary && (
                            <small className="text-danger">{errors.salary.message}</small>
                        )}
                    </div>
                </div>

                {/* CV Upload */}
                <div className="col-lg-6 col-md-6">
                    <div className="tp-application-form-input tp-application-form-upload mb-30">
                        <label className="tp-label d-block">Upload your CV *</label>
                        <input
                            className="tp-file"
                            type="file"
                            {...register("cv", {
                                required: "CV is required",
                            })}
                        />
                        {errors.cv && (
                            <small className="text-danger">{errors.cv.message}</small>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="col-lg-6 col-md-6">
                    <div className="tp-application-form-btn mt-15 mb-30 text-md-end">
                        <button
                            type="submit"
                            className="tp-btn-green tp-btn-anim"
                            disabled={isSubmitting}
                        >
                            <span className="tp-btn-text">
                                {isSubmitting ? "Submitting..." : "Submit Now"}
                            </span>
                            <span>
                                <ButtonArrowIcon />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default JobApplicationForm;
