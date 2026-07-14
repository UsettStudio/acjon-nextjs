
const ShopPrice = () => {
    return (
        <div className="accordion-item">
            <h2 className="accordion-header" id="price__widget">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#price_widget_collapse" aria-expanded="true" aria-controls="price_widget_collapse">
                    Price
                </button>
            </h2>
            <div id="price_widget_collapse" className="accordion-collapse collapse show" aria-labelledby="price__widget" data-bs-parent="#shop_price">
                <div className="accordion-body">
                    <div className="shop__widget-list">
                        <div className="shop__widget-list-item">
                            <input type="checkbox" id="higher" defaultChecked={false} />
                            <label htmlFor="higher">$10.00 - $49.00</label>
                        </div>
                        <div className="shop__widget-list-item">
                            <input type="checkbox" id="high" defaultChecked={false} />
                            <label htmlFor="high">$50.00 - $99.00</label>
                        </div>
                        <div className="shop__widget-list-item">
                            <input type="checkbox" id="medium" defaultChecked={false} />
                            <label htmlFor="medium">$100.00 - $199.00</label>
                        </div>
                        <div className="shop__widget-list-item">
                            <input type="checkbox" id="low" defaultChecked={false} />
                            <label htmlFor="low">$200.00 +</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ShopPrice;