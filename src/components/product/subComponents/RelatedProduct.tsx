import productData from "@/data/productData";
import SingleProduct from "./SingleProduct";

const RelatedProduct = () => {
    // display product items
    const displayProductItems = productData.slice(0, 4);
    
    return (
        <section className="product__related-area pb-80">
            <div className="container">
                <div className="row">
                    <div className="col-xl-12">
                        <div className="section__title-wrapper-13 mb-35">
                            <h3 className="section__title-13">Related Products</h3>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {/* product items start */}
                    {displayProductItems.map((product) => (
                        <div key={product.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                            <SingleProduct product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RelatedProduct;