import PersonalPServiceItem from "./subComponents/PersonalPServiceItem";
import servicesData from "@/data/serviceData";
import Image from "next/image";
import React from "react";

interface PersonalPortfolioServiceProps {
    sectionPaddingClass?: string;
    showDecorativeShape?: boolean;
}

const PersonalPortfolioService: React.FC<PersonalPortfolioServiceProps> = ({ sectionPaddingClass = "pt-50 pb-50", showDecorativeShape = false }) => {
    return (
        <div className="d-flex align-items-center justify-content-center h-100">
            <section className={`tp-about-me-service-ptb p-relative w-100 ${sectionPaddingClass}`}>
                {showDecorativeShape && (
                    <div
                        className="tp-about-me-service-shape"
                        data-speed="1.1"
                    >
                        <Image
                            width={166}
                            height={382}
                            src="/assets/img/inner-image/about-me/about-me-shape-2.png"
                            alt="decorative shape"
                        />
                    </div>
                )}

                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            {/* Section Heading */}
                            <div className="tp-about-me-service-heading mb-30">
                                <h4 className="tp-about-me-service-title">Our Services</h4>
                            </div>

                            {/* Services List */}
                            <div className="tp-about-me-service-item-wrapper">
                                {servicesData.slice(32, 36).map((service, index) => (
                                    <PersonalPServiceItem key={index} {...service} />
                                )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PersonalPortfolioService;
