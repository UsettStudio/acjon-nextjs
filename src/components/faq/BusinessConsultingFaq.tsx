"use client";
import BusinessCFaqItem from './subComponents/BusinessCFaqItem';
import { VideoPlayIconThree } from '@/svg/VideoPlayIcons';
import { useVideoModal } from '@/provider/VideoProvider';
import { faqDt } from '@/types/custom-dt';
import Image from 'next/image';

const faqData: faqDt[] = [
    {
        id: "collapseOne",
        question: "What services does your agency offer?",
        answer:
            "From branding to web development, our team delivers a seamless experience with great attention to detail and responsiveness.",
        show: true,
    },
    {
        id: "collapseTwo",
        question: "Do you provide custom website solutions?",
        answer:
            "Yes, we create fully customized websites tailored to meet your brand’s unique goals and audience.",
    },
    {
        id: "collapseThree",
        question: "Can you redesign my existing website?",
        answer:
            "Absolutely! We specialize in redesigning outdated websites to make them modern, user-friendly, and conversion-focused.",
    },
    {
        id: "collapseFour",
        question: "Do you offer digital marketing solutions?",
        answer:
            "Yes, our digital marketing services include SEO, social media marketing, and performance campaigns to help your business grow.",
    },
    {
        id: "collapseFive",
        question: "Is there a consultation fee?",
        answer:
            "No, our initial consultation is completely free to help you discuss ideas and goals before starting a project.",
    },
];

const BusinessConsultingFaq = () => {
    const { playVideo } = useVideoModal();

    return (
        <div className="bnc-faq-area pt-110 p-relative" style={{ backgroundColor: "#ECF8F8" }}>
            <div className="bnc-faq-thumb-wrapper">
                <div className="bnc-faq-thumb fix p-relative">
                    <Image width={895} height={997} className="anim-zoomin" src="/assets/img/business-consulting/pricing/faq-thumb.jpg" alt="faq thumb" />
                    <div className="bnc-video-thumb-btn">
                        <button onClick={() => { playVideo("VCPGMjCW0is") }} className="dgm-hero-play-btn popup-video video-animetion">
                            <i>
                                <VideoPlayIconThree />
                            </i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="container container-1510">
                <div className="row">
                    <div className="offset-xl-6 col-xl-6 col-lg-12">
                        <div className="bnc-faq-wrapper pb-100">
                            <div className="bnc-faq-title-box pb-40">
                                <span className="tp-section-subtitle fs-16 st-dot tp-split-title">
                                    Our FAQ
                                </span>
                                <h3 className="tp-section-title fs-52 mb-15 tp-split-title">
                                    Explore our frequently <br /> asked questions.
                                </h3>
                            </div>

                            <div className="tp-faq-accordion-wrap">
                                <div className="accordions" id="accordionExample">
                                    {faqData.map((item, index) => (
                                        <BusinessCFaqItem {...item} key={index} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessConsultingFaq;