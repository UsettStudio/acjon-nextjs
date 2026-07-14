import CommonSingleFaq from './subComponents/CommonSingleFaq';
import { faqData } from '@/data/faqData';

const HomeFaq = () => {
    return (
        <div className="tp-faq-ptb p-relative pb-140">
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-5">
                        <div className="tp-faq-title-box p-relative mb-40">
                            <span className="tp-section-subtitle tp-split-title">{`// Our Faq`}</span>
                            <h3 className="tp-section-title mb-0 tp-split-title">
                                Questions <br /> And Answers
                            </h3>
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="tp-faq-accordion-wrap">
                            <div className="accordions" id="accordionExample">
                                {faqData.common.map((item, index) => (
                                   <CommonSingleFaq key={index} item={item}/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeFaq;
