import React, { JSX } from "react";

type ProductRatingNumberProps = {
  rating: number; // e.g. 4.5
  maxRating?: number; // default 5
};

const ProductRatingNumber: React.FC<ProductRatingNumberProps> = ({
  rating,
  maxRating = 5,
}) => {
  const renderStars = (): JSX.Element[] => {
    const stars: JSX.Element[] = [];

    for (let i = 1; i <= maxRating; i++) {
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
    <>
      <h4 className="product-rating-number-title">
        {rating.toFixed(1)}
      </h4>

      <div className="product-rating-star">{renderStars()}</div>
    </>
  );
};

export default ProductRatingNumber;
