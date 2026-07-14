import React from "react";

interface RatingBarItem  {
  star: number;
  percentage: number;
};
const ratingBars: RatingBarItem[] = [
  { star: 5, percentage: 70 },
  { star: 4, percentage: 60 },
  { star: 3, percentage: 40 },
  { star: 2, percentage: 10 },
  { star: 1, percentage: 25 },
];

const ProductRatingBar: React.FC = () => {
  return (
    <>
      {ratingBars.map(({ star, percentage }) => (
        <div
          key={star}
          className="product-rating-bar-item d-flex align-items-center"
        >
          <div className="product-rating-bar-text">
            <span>{star}</span>
          </div>

          <div className="product-rating-bar">
            <div
              className="single-progress"
              style={{ width: `${percentage}%` }}
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductRatingBar;
