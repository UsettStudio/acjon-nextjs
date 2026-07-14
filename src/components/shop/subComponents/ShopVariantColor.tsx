
const ShopVariantColor = () => {
    return (
        <div className="accordion-item">
            <h2 className="accordion-header" id="color__widget">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#color_widget_collapse" aria-expanded="true" aria-controls="color_widget_collapse">
                    Color
                </button>
            </h2>
            <div id="color_widget_collapse" className="accordion-collapse collapse show" aria-labelledby="color__widget" data-bs-parent="#shop_color">
                <div className="accordion-body">
                    <div className="shop__widget-list">
                        <div className="shop__widget-list-item-2">
                            <input type="checkbox" id="c-black" defaultChecked={false} />
                            <label htmlFor="c-black">Black</label>
                        </div>
                        <div className="shop__widget-list-item-2 has-orange">
                            <input type="checkbox" id="c-orange" defaultChecked={false} />
                            <label htmlFor="c-orange">Orange</label>
                        </div>
                        <div className="shop__widget-list-item-2 has-green">
                            <input type="checkbox" id="c-green" defaultChecked={false} />
                            <label htmlFor="c-green">Green</label>
                        </div>
                        <div className="shop__widget-list-item-2 has-red">
                            <input type="checkbox" id="c-red" defaultChecked={false} />
                            <label htmlFor="c-red">Red</label>
                        </div>
                        <div className="shop__widget-list-item-2 has-yellow">
                            <input type="checkbox" id="c-yellow" defaultChecked={false} />
                            <label htmlFor="c-yellow">Yellow</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopVariantColor;