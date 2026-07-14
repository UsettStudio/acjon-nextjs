import { ArrowIconSeven, CheckIconFour } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const LawyerAgencyAbout = () => {
    return (
        <div className="lw-about-area pb-120">
            <div className="container">
                <div className="row">
                    <div className="col-xl-6">
                        <div className="lw-about-thumb p-relative text-xl-end">
                            <Image className='img-fluid w-100 h-100' width={503} height={553} src="/assets/img/lawyer-agency/about/ab-1.jpg" alt="about image" />
                            <Image width={360} height={360} className="img-fluid w-100 h-100 lw-about-thumb-inner" data-speed="1.1"
                                src="/assets/img/lawyer-agency/about/ab-2.jpg" alt="about image" />
                        </div>
                    </div>
                    <div className="col-xl-6">
                        <div className="lw-about-right mt-30">
                            <div className="lw-about-title-box">
                                <span className="lw-section-subtitle mb-15">
                                    <i className="fa-light fa-gavel"></i>
                                    Our about Us
                                </span>
                                <h4 className="tp-section-title title-playfair mb-20 tp-split-title">
                                    Shaping success <span>Through</span> <br /> <span>expertise</span> and innovation
                                </h4>
                                <p>
                                    We believe that every client has unique needs <br />
                                    and our services are designed.
                                </p>
                            </div>
                            <div className="lw-about-list">
                                <ul>
                                    <li>
                                        <span>
                                            <CheckIconFour />
                                        </span>
                                        <p>Client-Cantered Approach</p>
                                    </li>
                                    <li>
                                        <span>
                                            <CheckIconFour />
                                        </span>
                                        <p>Personalized Legal Strategies</p>
                                    </li>
                                </ul>
                            </div>
                            <div className="lw-about-btn">
                                <Link className="tp-btn-radius d-inline-flex align-items-center justify-content-between" href="/about">
                                    <span>
                                        <span className="text-1">Read More</span>
                                        <span className="text-2">Read More</span>
                                    </span>
                                    <i>
                                        <span>
                                            <ArrowIconSeven />
                                            <ArrowIconSeven />
                                        </span>
                                    </i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerAgencyAbout;