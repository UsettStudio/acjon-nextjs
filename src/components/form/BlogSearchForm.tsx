"use client";
import { useForm } from "react-hook-form";
import { SearchIcon } from "@/svg/ShopIcons";

type SearchFormData = {
    keyword: string;
};

const BlogSearchForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SearchFormData>();

    const onSubmit = () => { };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="sidebar-search-input">
                <input
                    type="text"
                    placeholder="Search..."
                    {...register("keyword", {
                        required: "Search keyword is required",
                        minLength: {
                            value: 2,
                            message: "Minimum 2 characters required",
                        },
                    })}
                />
                <button type="submit">
                    <SearchIcon width="20" height="20" />
                </button>
            </div>

            {errors.keyword && (
                <p className="error-text mt-5">{errors.keyword.message}</p>
            )}
        </form>
    );
};

export default BlogSearchForm;
