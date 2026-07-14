import { SearchIcon } from "@/svg/ShopIcons";

const ShopModel = () => {
    return (
        <div className="accordion-item">
            <h2 className="accordion-header" id="model__widget">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#model_widget_collapse" aria-expanded="true" aria-controls="model_widget_collapse">
                    Model
                </button>
            </h2>
            <div id="model_widget_collapse" className="accordion-collapse collapse show" aria-labelledby="model__widget" data-bs-parent="#shop_model">
                <div className="accordion-body">
                    <div className="shop__widget-search pt-10 pb-25">
                        <form action="#">
                            <div className="shop__widget-search-input">
                                <input type="text" placeholder="Search model" />
                                <button type="submit">
                                    <SearchIcon />
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="shop__widget-list">
                        <div className="shop__widget-list-item">
                            <input type="checkbox" id="iphone_12" defaultChecked={false} />
                            <label htmlFor="iphone_12">iPhone 12</label>
                        </div>
                        <div className="shop__widget-list-item">
                            <input type="checkbox" id="iphone_12_pro" defaultChecked={false} />
                            <label htmlFor="iphone_12_pro">iPhone 12 Pro</label>
                        </div>
                        <div className="shop__widget-list-item">
                            <input type="checkbox" id="iphone_11_pro" defaultChecked={false} />
                            <label htmlFor="iphone_11_pro">iPhone 11 Pro</label>
                        </div>
                        <div className="shop__widget-list-item">
                            <input type="checkbox" id="samsung" defaultChecked={false} />
                            <label htmlFor="samsung">Samsung Galaxy S31</label>
                        </div>
                        <div className="shop__widget-list-item">
                            <input type="checkbox" id="samsung_s20" defaultChecked={false} />
                            <label htmlFor="samsung_s20">Samsung Galaxy S20</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopModel;