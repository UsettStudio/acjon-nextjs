import AddReviewForm from "../form/AddReviewForm";
import DescriptionContent from "./subComponents/DescriptionContent";
import ProductDetailsAdditionalInfo from "./subComponents/ProductDetailsAdditionalInfo";
import ProductRatingBar from "./subComponents/ProductRatingBar";
import ProductRatingNumber from "./subComponents/ProductRatingNumber";
import ProductReviewItem from "./subComponents/ProductReviewItem";
type ProductReview = {
    id: number;
    name: string;
    avatar: string;
    rating: number; // 1–5 (supports half)
    date: string;
    comment: string;
};
const reviews: ProductReview[] = [
    {
        id: 1,
        name: "Michelle Hunter",
        avatar: "/assets/img/digital-marketing/avater/avater-1.png",
        rating: 4.5,
        date: "August 8, 2022",
        comment:
            "I’m upgrading from a series 1, so it is a completely different watch. I am very satisfied with this purchase.",
    },
    {
        id: 2,
        name: "Sean Hathaway",
        avatar: "/assets/img/digital-marketing/avater/avater-2.png",
        rating: 4.5,
        date: "August 10, 2022",
        comment:
            "I’m upgrading from a series 1, so it is a completely different watch. I am very satisfied with this purchase.",
    },
];

const ProductDetailsTabContent = () => {
    return (
        <section className="product__details-tab-area pb-110">
            <div className="container">
                <div className="row">
                    <div className="col-xl-12">
                        <div className="product__details-tab-nav">
                            <nav>
                                <div className="product__details-tab-nav-inner nav tp-tab-menu d-flex flex-sm-nowrap flex-wrap" id="nav-tab-info" role="tablist">

                                    <button className="nav-link active" id="nav-desc-tab" data-bs-toggle="tab" data-bs-target="#nav-desc" type="button" role="tab" aria-controls="nav-desc" aria-selected="true">Description</button>

                                    <button className="nav-link" id="nav-additional-tab" data-bs-toggle="tab" data-bs-target="#nav-additional" type="button" role="tab" aria-controls="nav-additional" aria-selected="false">Additional information</button>

                                    <button className="nav-link" id="nav-review-tab" data-bs-toggle="tab" data-bs-target="#nav-review" type="button" role="tab" aria-controls="nav-review" aria-selected="false">Reviews (02)</button>
                                </div>
                            </nav>
                        </div>
                        <div className="product__details-tab-content">
                            <div className="tab-content" id="nav-tabContent-info">
                                <div className="tab-pane fade show active" id="nav-desc" role="tabpanel" aria-labelledby="nav-desc-tab">
                                    <div className="product__details-description pt-95">
                                        <DescriptionContent />
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="nav-additional" role="tabpanel" aria-labelledby="nav-additional-tab">
                                    <div className="product__details-additional">
                                        <div className="row">
                                            <div className="col-xl-9">
                                                <div className="product__details-additional-inner">
                                                    <ProductDetailsAdditionalInfo />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="nav-review" role="tabpanel" aria-labelledby="nav-review-tab">
                                    <div className="product__details-review pt-60">
                                        <div className="row">
                                            <div className="col-xl-9">
                                                <div className="product__details-review-inner">
                                                    <div className="product-rating">
                                                        <h4 className="product-rating-title">Ratings and reviews</h4>
                                                        <div className="product-rating-wrapper d-flex flex-wrap align-items-center mb-50">
                                                            <div className="product-rating-number mr-40">
                                                                <ProductRatingNumber rating={4.5} />
                                                            </div>
                                                            <div className="product-rating-bar-wrapper">
                                                                <ProductRatingBar />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="product__details-review-list mb-65">
                                                        {reviews.map((review) => (
                                                            <ProductReviewItem key={review.id} review={review} />
                                                        ))}
                                                    </div>
                                                    <div className="product-review-form">
                                                        <h3 className="product-review-form-title">Add a review</h3>
                                                        <p>Your email address will not be published. Required fields are marked *</p>
                                                        {/* review form component  */}
                                                        <AddReviewForm />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDetailsTabContent;