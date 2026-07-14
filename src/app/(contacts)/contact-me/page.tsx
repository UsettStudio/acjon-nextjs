import AboutMeInstagram from "@/components/instagram/AboutMeInstagram";
import ContactMeForm from "@/components/form/ContactMeForm";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Content Me - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            {/* -- contact me area start -- */}
            <div className="tp-contact-me-ptb pt-220 pb-130">
                <div className="container container-1320">
                    <div className="row">
                        <div className="col-xl-6">
                            <div className="tp-contact-me-heading mb-50">
                                <div className="tp-section-title tp-split-title mb-40">{`Let's`} discuss <br /> <span>
                                    <Image width={59} height={54} src="/assets/img/inner-image/contact/contact-me-shape.png" alt="contact shape" />
                                </span> your project!</div>
                                <div className="tp-contact-me-wrap tp_fade_anim" data-delay=".5">
                                    <span className="tp-contact-me-subtitle">Contract</span>
                                    <p>We are a forward-thinking digital <br /> creative agency dedicated.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6">
                            <div className="tp-contact-me-wrapper tp_fade_anim" data-delay=".5">
                                <div className="tp-contact-me-form-wrap">
                                    <ContactMeForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* about instragram */}
            <AboutMeInstagram />
        </main>
    );
};

export default page;