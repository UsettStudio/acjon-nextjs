import { ArrowIconNine, ArrowIconTen, CDotIconTwo, StarIconEight } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const BusinessConsultingBanner = () => {
    return (
        <div className="bnc-banner-area bnc-banner-bg z-index-1" style={{ backgroundColor: "#ECF8F8" }}>
            <div className="bnc-banner-thumb">
                <Image width={1905} height={985} data-speed=".7" src="/assets/img/business-consulting/banner/banner-thumb-1.jpg" alt="banner image" />
            </div>
            <div className="bnc-banner-bottom-box">
                <div className="container container-1510">
                    <div className="row align-items-end">
                        <div className="col-lg-4">
                            <div className="bnc-banner-item p-relative"
                                style={{ backgroundImage: `url(/assets/img/business-consulting/banner/banner-shape-1.jpg)` }}>
                                <div className="bnc-banner-item-content">
                                    <h3 className="bnc-banner-item-title">hey!</h3>
                                    <p>word - class <br /> Digital Business <br />
                                        Consulting</p>
                                </div>
                                <div className="bnc-banner-item-btn">
                                    <Link href="/about">
                                        <span>
                                            <ArrowIconNine />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="bnc-banner-bottom-wrapper d-flex justify-content-between pb-45">
                                <div className="bnc-banner-input">
                                    <h4 className="bnc-banner-b-title">get a free Consultions</h4>
                                    <div className="bnc-banner-input-box p-relative">
                                        <input type="text" placeholder="Your Email Id" />
                                        <button>
                                            <ArrowIconTen />
                                        </button>
                                    </div>
                                </div>
                                <div className="bnc-banner-review">
                                    <h4 className="bnc-banner-b-title">Happy Customer</h4>
                                    <div className="tp-testimonial-review-item">
                                        <div className="d-flex">
                                            <div className="tp-testimonial-review-icon">
                                                <span>
                                                    <CDotIconTwo />
                                                </span>
                                            </div>
                                            <div className="tp-testimonial-review-content">
                                                <span>4.9/5
                                                    <StarIconEight />
                                                </span>
                                                <p>Based on 24 reviews on Clutch</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bnc-banner-success">
                                    <h4 className="bnc-banner-b-title">Success rate</h4>
                                    <div className="bnc-banner-success-item d-flex">
                                        <div className="bnc-banner-success-icon">
                                            <Image width={50} height={50} src="/assets/img/business-consulting/banner/banner-shape-2.png" alt="banner shape" />
                                        </div>
                                        <div className="bnc-banner-success-content">
                                            <h4>99%</h4>
                                            <p>credibly harness client</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessConsultingBanner;