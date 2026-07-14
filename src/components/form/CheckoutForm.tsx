"use client";
import NiceSelect from "@/ui/NiceSelect";

const CheckoutForm = () => {
    const selectHandler = () => { };
    return (
        <form action="#">
            <div className="row">
                <div className="col-lg-6">
                    <div className="checkbox-form">
                        <h3>Billing Details</h3>
                        <div className="row">
                            <div className="col-md-12">
                                <div id="customSelect" className="custom-select">
                                    <NiceSelect
                                        options={[
                                            { value: "1", text: "Bangladesh" },
                                            { value: "2", text: "Algeria" },
                                            { value: "3", text: "Albania" },
                                            { value: "4", text: "Colombia" },
                                            { value: "5", text: "Dominican Republic" },
                                        ]}
                                        defaultCurrent={0}
                                        onChange={selectHandler}
                                        name="sort"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="checkout-form-list">
                                    <label>First Name <span className="required">*</span></label>
                                    <input type="text" placeholder="First Name" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="checkout-form-list">
                                    <label>Last Name <span className="required">*</span></label>
                                    <input type="text" placeholder="Last Name" />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="checkout-form-list">
                                    <label>Company Name</label>
                                    <input type="text" placeholder="example LTD." />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="checkout-form-list">
                                    <label>Address <span className="required">*</span></label>
                                    <input type="text" placeholder="Street address" />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="checkout-form-list">
                                    <input type="text" placeholder="Apartment, suite, unit etc. (optional)" />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="checkout-form-list">
                                    <label>Town / City <span className="required">*</span></label>
                                    <input type="text" placeholder="Town / City" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="checkout-form-list">
                                    <label>State / County <span className="required">*</span></label>
                                    <input type="text" placeholder="State / County" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="checkout-form-list">
                                    <label>Postcode / Zip <span className="required">*</span></label>
                                    <input type="text" placeholder="Postcode / Zip" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="checkout-form-list">
                                    <label>Email Address <span className="required">*</span></label>
                                    <input type="email" placeholder="Your Email" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="checkout-form-list">
                                    <label>Phone <span className="required">*</span></label>
                                    <input type="text" placeholder="Phone number" />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="checkout-form-list create-acc">
                                    <input id="cbox" type="checkbox" />
                                    <label htmlFor="cbox">Create an account?</label>
                                </div>
                                <div id="cbox_info" className="checkout-form-list create-account">
                                    <p>Create an account by entering the information below. If you are a returning
                                        customer please login at the top of the page.</p>
                                    <label>Account password <span className="required">*</span></label>
                                    <input type="password" placeholder="password" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="your-order mb-30 ">
                        <h3>Your order</h3>
                        <div className="your-order-table table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="product-name">Product</th>
                                        <th className="product-total">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="cart_item">
                                        <td className="product-name">
                                            Vestibulum suscipit <strong className="product-quantity"> × 1</strong>
                                        </td>
                                        <td className="product-total">
                                            <span className="amount">$165.00</span>
                                        </td>
                                    </tr>
                                    <tr className="cart_item">
                                        <td className="product-name">
                                            Vestibulum dictum magna <strong className="product-quantity"> × 1</strong>
                                        </td>
                                        <td className="product-total">
                                            <span className="amount">$50.00</span>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="cart-subtotal">
                                        <th>Cart Subtotal</th>
                                        <td><span className="amount">$215.00</span></td>
                                    </tr>
                                    <tr className="shipping">
                                        <th>Shipping</th>
                                        <td>
                                            <ul>
                                                <li>
                                                    <input id="flat_shipping" type="radio" name="shipping" />
                                                    <label htmlFor="flat_shipping">
                                                        Flat Rate: <span className="amount">$7.00</span>
                                                    </label>
                                                </li>
                                                <li>
                                                    <input id="free_shipping" type="radio" name="shipping" />
                                                    <label htmlFor="free_shipping">Free Shipping:</label>
                                                </li>
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr className="order-total">
                                        <th>Order Total</th>
                                        <td><strong><span className="amount">$215.00</span></strong>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="payment-method faq__wrapper tp-accordion">
                            <div className="accordion" id="checkoutAccordion">
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="checkoutOne">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#bankOne" aria-expanded="true" aria-controls="bankOne">
                                            Direct Bank Transfer
                                            <span className="accordion-btn"></span>
                                        </button>
                                    </h2>
                                    <div id="bankOne" className="accordion-collapse collapse show" aria-labelledby="checkoutOne" data-bs-parent="#checkoutAccordion">
                                        <div className="accordion-body">
                                            <p>Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order won’t be shipped until the funds have cleared in our account.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="paymentTwo">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#payment" aria-expanded="false" aria-controls="payment">
                                            Cheque Payment
                                            <span className="accordion-btn"></span>
                                        </button>
                                    </h2>
                                    <div id="payment" className="accordion-collapse collapse" aria-labelledby="paymentTwo" data-bs-parent="#checkoutAccordion">
                                        <div className="accordion-body">
                                            <p>Please send your cheque to Store Name, Store Street, Store Town, Store State / County, Store Postcode.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="paypalThree">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#paypal" aria-expanded="false" aria-controls="paypal">
                                            PayPal
                                            <span className="accordion-btn"></span>
                                        </button>
                                    </h2>
                                    <div id="paypal" className="accordion-collapse collapse" aria-labelledby="paypalThree" data-bs-parent="#checkoutAccordion">
                                        <div className="accordion-body">
                                            <p>Pay via PayPal; you can pay with your credit card if you don&apos;t have a
                                                PayPal account.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-button-payment mt-20">
                                <button type="submit" className="tp-btn">Place order</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CheckoutForm;