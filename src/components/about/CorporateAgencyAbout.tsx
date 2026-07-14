import Image from 'next/image';
import React from 'react';

const progressItems = [
    { label: 'Creative Development', value: 80 },
    { label: 'Corporate Agency', value: 75 },
    { label: 'Corporate Design', value: 90 },
];

const CorporateAgencyAbout: React.FC = () => {
    return (
        <div className="cr-about-area cr-about-style pt-120 pb-160">
            <div className="container container-1510">
                <div className="row gx-60">
                    <div className="col-xl-5 col-lg-6">
                        <div className="cr-about-thumb tp-clip-anim">
                            <Image
                                width={584}
                                height={700}
                                className="tp-anim-img"
                                data-animate="true"
                                src="/assets/img/corporate-agency/about/about-1.jpg"
                                alt="about"
                            />
                        </div>
                    </div>

                    <div className="col-xl-7 col-lg-6">
                        <div className="cr-about-box p-relative">
                            <div className="cr-about-shape">
                                <Image width={64} height={64} src="/assets/img/corporate-agency/banner/choose-us-shape-1.png" alt="shape" />
                            </div>

                            <div className="cr-about-title-box mb-10">
                                <span className="tp-section-subtitle st-spacegro fs-16 st-dot tp-split-title">
                                    About us
                                </span>
                                <h3 className="tp-section-title tl-spacegro fw-700 text-case-int tp-split-title">
                                    Digital experiences <br /> that the inspire.
                                </h3>
                            </div>

                            <div className="cr-about-text mb-45 tp_fade_anim" data-delay=".6">
                                <p>
                                    Dedicated to driving success through cutting-edge strategies <br />
                                    solutions. With a strong foundation in creativity and technology, <br />
                                    digital architects. Our mission is to craft visually stunning.
                                </p>
                            </div>
                        </div>

                        {/* Progress Bars */}
                        <div className="tp-progress-bg">
                            <div className="row">
                                <div className="col-xl-8 col-lg-12">
                                    <div className="tp-progress-bar-wrap">
                                        {progressItems.map(({ label, value }, index) => (
                                            <div className="tp-progress-bar-item" key={index}>
                                                <div className="tp-progress-bar-title d-flex justify-content-between">
                                                    <label>{label}</label>
                                                    <span>{value}%</span>
                                                </div>
                                                <div className="tp-progress-bar">
                                                    <div className="progress">
                                                        <div
                                                            className="progress-bar wow slideInLeft"
                                                            data-wow-delay=".1s"
                                                            data-wow-duration="2s"
                                                            role="progressbar"
                                                            data-width={`${value}%`}
                                                            aria-valuenow={value}
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                            style={{ width: `${value}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-xl-4 col-lg-12">
                                    <div className="cr-about-thumb tp-clip-anim sm p-relative">
                                        <Image
                                            width={311}
                                            height={313}
                                            className="w-100 tp-anim-img"
                                            data-animate="true"
                                            src="/assets/img/corporate-agency/about/about-2.jpg"
                                            alt="about image"
                                        />
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

export default CorporateAgencyAbout;
