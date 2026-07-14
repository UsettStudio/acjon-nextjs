import { ProductReview } from "@/types/custom-dt";
import React, { JSX } from "react";
import Image from "next/image";

interface ProductReviewItemProps {
    review: ProductReview;
};

const ProductReviewItem: React.FC<ProductReviewItemProps> = ({ review }) => {
    const { name, avatar, rating, date, comment } = review;

    const renderStars = (rating: number): JSX.Element[] => {
        const stars: JSX.Element[] = [];

        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars.push(
                    <span key={i}>
                        <i className="fa-solid fa-star"></i>
                    </span>
                );
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                stars.push(
                    <span key={i}>
                        <i className="fa-solid fa-star-half-stroke"></i>
                    </span>
                );
            } else {
                stars.push(
                    <span key={i}>
                        <i className="fa-regular fa-star"></i>
                    </span>
                );
            }
        }

        return stars;
    };

    return (
        <div className="product-review-item">
            <div className="product-review-avater d-flex align-items-center">
                <div className="product-review-avater-thumb">
                    <Image width={100} height={100} src={avatar} alt={name} />
                </div>
                <div className="product-review-avater-info">
                    <h4 className="product-review-avater-title">{name}</h4>
                </div>
            </div>

            <div className="product-review-rating d-flex align-items-center">
                <div className="product-review-rating-wrapper d-flex">
                    {renderStars(rating)}
                </div>
                <div className="product-review-rating-date">
                    <span>{date}</span>
                </div>
            </div>

            <p>{comment}</p>
        </div>
    );
};

export default ProductReviewItem;
