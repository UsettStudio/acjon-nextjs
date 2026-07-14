
const ShopCategories = () => {
    return (
        <div className="accordion-item">
            <h2 className="accordion-header" id="category__widget">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#cagetory_widget_collapse" aria-expanded="true" aria-controls="cagetory_widget_collapse">
                    Categories
                </button>
            </h2>
            <div id="cagetory_widget_collapse" className="accordion-collapse collapse show" aria-labelledby="category__widget" data-bs-parent="#shop_category">
                <div className="accordion-body">
                    <div className="shop__widget-list">
                        <div className="shop__widget-list-item">
                            <input
                                type="checkbox"
                                id="iphone"
                                defaultChecked={false}
                            />
                            <label htmlFor="iphone">iPhone Cases (08)</label>
                        </div>
                        <div className="shop__widget-list-item">
                            <input type="checkbox" id="android"
                                defaultChecked={false}
                            />
                            <label htmlFor="android">Android Cases (04)</label>
                        </div>
                        <div className="shop__widget-list-item">
                            <input type="checkbox" id="accessories" defaultChecked={false} />
                            <label htmlFor="accessories">Accessories (02)</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopCategories;