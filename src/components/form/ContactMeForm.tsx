"use client";
import { ArrowIconFive } from "@/svg/ArrowIcon";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type FormData = {
    name: string;
    email: string;
    subject: string;
    website: string;
    interests: string[];
    budget: string[];
    exactBudget: string;
    timeline: string;
    message: string;
};

const ContactMeForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = () => {
        // Replace this with real API call
        // await fetch("/api/contact-me", { method: "POST", body: JSON.stringify(data) });
        toast.success("Message sent successfully");
        reset();
    };

    const onError = () => {
        toast.error("Please fill all required fields");
    };

    return (
        <form id="contact-form" onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="row">
                {/* Name */}
                <div className="col-lg-12">
                    <div className="tp-contact-me-form-input mb-20">
                        <input
                            type="text"
                            placeholder="Name"
                            {...register("name", { required: "Name is required" })}
                        />
                        {errors.name && <p className="error-text">{errors.name.message}</p>}
                    </div>
                </div>

                {/* Email */}
                <div className="col-lg-12">
                    <div className="tp-contact-me-form-input mb-20">
                        <input
                            type="email"
                            placeholder="Your Email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: "Invalid email address",
                                },
                            })}
                        />
                        {errors.email && <p className="error-text">{errors.email.message}</p>}
                    </div>
                </div>

                {/* Company */}
                <div className="col-lg-12">
                    <div className="tp-contact-me-form-input mb-20">
                        <input
                            type="text"
                            placeholder="Company Name"
                            {...register("subject", { required: "Company name is required" })}
                        />
                        {errors.subject && (
                            <p className="error-text">{errors.subject.message}</p>
                        )}
                    </div>
                </div>

                {/* Website */}
                <div className="col-lg-12">
                    <div className="tp-contact-me-form-input mb-20">
                        <input
                            type="text"
                            placeholder="Company Website"
                            {...register("website")}
                        />
                    </div>
                </div>

                {/* Interested In */}
                <div className="col-lg-12">
                    <div className="tp-contact-me-form-category-wrap mb-50 pt-40">
                        <h4 className="tp-contact-me-form-category-title">
                            {`I'm`} Interested in...
                        </h4>

                        <div className="tp-contact-me-form-category-list">
                            {[
                                "Branding",
                                "Design Concept",
                                "App Design",
                                "Android Development",
                                "iOS Development",
                                "Web Design",
                                "Logo",
                            ].map((item) => (
                                <span key={item}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={item}
                                            {...register("interests", {
                                                required: "Select at least one interest",
                                            })}
                                        />
                                        <span>{item}</span>
                                    </label>
                                </span>
                            ))}
                        </div>

                        {errors.interests && (
                            <p className="error-text">{errors.interests.message}</p>
                        )}
                    </div>

                    {/* Budget */}
                    <div className="tp-contact-me-form-category-wrap mb-50">
                        <h4 className="tp-contact-me-form-category-title">
                            MY Budget Is :
                        </h4>

                        <div className="tp-contact-me-form-category-list plr">
                            {["2k", "2-5k", "5-10k", "10-15k", "15-20k"].map((item) => (
                                <span key={item}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={item}
                                            {...register("budget", {
                                                required: "Please select a budget range",
                                            })}
                                        />
                                        <span>{item}</span>
                                    </label>
                                </span>
                            ))}
                        </div>

                        {errors.budget && (
                            <p className="error-text">{errors.budget.message}</p>
                        )}
                    </div>
                </div>

                {/* Exact Budget */}
                <div className="col-lg-12">
                    <div className="tp-contact-me-form-input mb-20">
                        <input
                            type="text"
                            placeholder="Do you have an exact budget?"
                            {...register("exactBudget")}
                        />
                    </div>
                </div>

                {/* Timeline */}
                <div className="col-lg-12">
                    <div className="tp-contact-me-form-input mb-20">
                        <input
                            type="text"
                            placeholder="What is your timeline?"
                            {...register("timeline", { required: "Timeline is required" })}
                        />
                        {errors.timeline && (
                            <p className="error-text">{errors.timeline.message}</p>
                        )}
                    </div>
                </div>

                {/* Message */}
                <div className="col-lg-12">
                    <div className="tp-contact-me-form-input mb-20">
                        <textarea
                            placeholder="Message"
                            {...register("message", {
                                required: "Message is required",
                                minLength: {
                                    value: 10,
                                    message: "Message must be at least 10 characters",
                                },
                            })}
                        />
                        {errors.message && (
                            <p className="error-text">{errors.message.message}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="tp-contact-me-form-btn">
                        <button type="submit">
                            Send Message{" "}
                            <span>
                                <ArrowIconFive />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ContactMeForm;
