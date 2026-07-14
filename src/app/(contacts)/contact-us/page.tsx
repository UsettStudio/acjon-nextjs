import ContactUsTopArea from "@/components/contact/ContactUsTopArea";
import ContactForm from "@/components/form/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kontakt oss – Usett | 3D-studio",
};

const page = () => {
    return (
        <main>
            {/* -- contact top area start -- */}
            <ContactUsTopArea />
            {/* -- contact us area start -- */}
            <div className="tp-contact-us-form-ptb pb-160">
                <div className="container container-1480">
                    <div className="tp-contact-us-form-border">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="tp-contact-us-form-wrapper">
                                    <div className="tp-contact-us-form-heading text-center mb-50">
                                        <span className="tp-contact-us-form-subtitle">Ta kontakt</span>
                                        <h4 className="tp-contact-us-form-title">Hvordan kan vi hjelpe deg?</h4>
                                    </div>
                                    <div className="tp-contact-us-form-wrap">
                                        <ContactForm />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default page;
