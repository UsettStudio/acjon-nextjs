import CheckoutForm from "@/components/form/CheckoutForm";
import CouponArea from "@/components/shop/CouponArea";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Checkout - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            {/* coupun area start */}
            <CouponArea />

            {/* checkout area start */}
            <section className="checkout-area pb-85">
                <div className="container">
                    <CheckoutForm />
                </div>
            </section>
        </main>
    );
};

export default page;