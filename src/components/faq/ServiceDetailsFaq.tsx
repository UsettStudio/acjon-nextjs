import CommonSingleFaq from "./subComponents/CommonSingleFaq";
import { faqData } from "@/data/faqData";

const ServiceDetailsFaq = () => {
    return (
        <div className="tp-faq-ptb inner-faq-style p-relative pt-80 pb-140">
            <div className="container">
                <div className="row">
                    <div className="col-lg-5">
                        <div className="tp-faq-title-box p-relative mb-40">
                            <span className="tp-section-subtitle st-unbounded st-dot st-border tp_fade_anim" data-delay=".3">Faq</span>
                            <h3 className="tp-section-title mb-0 tp-split-title">Creating Products<br />  That Users Love to Use.</h3>
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="tp-faq-accordion-wrap tp_fade_anim" data-delay=".5">
                            <div className="accordions" id="accordionExample">
                                {faqData.common.map((item, index) => (
                                    <CommonSingleFaq key={index} item={item} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailsFaq;