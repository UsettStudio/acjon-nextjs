import BusinessCServiceItem from './subComponents/BusinessCServiceItem';
import { ArrowIconFive } from '@/svg/ArrowIcon';
import servicesData from '@/data/serviceData';
import Image from 'next/image';
import Link from 'next/link';

const BusinessConsultingService = ({ spacingCustomCls = "pt-145 pb-130" }) => {
    return (
        <div className={`bnc-service-area bnc-service-ptb ${spacingCustomCls}`}>
            <div className="container container-1510">
                {/* === Header Section === */}
                <div className="row align-items-end">
                    <div className="col-lg-6">
                        <div className="bnc-service-title-box pb-70">
                            <span className="tp-section-subtitle fs-16 st-dot tp-split-title">
                                Our Latest Services
                            </span>
                            <h3 className="tp-section-title fs-72 tp-split-title">
                                Driving Business <br /> Excellence Through.
                            </h3>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div
                            className="bnc-service-btn text-lg-end pb-75 tp_fade_anim"
                            data-delay=".5"
                            data-fade-from="top"
                            data-ease="bounce"
                        >
                            <Link
                                href="/service"
                                className="tp-btn-green bdr-5 fw-700 ff-bricolage tp-btn-anim"
                            >
                                <div className="tp-btn-text">See All Services</div>
                                <span>
                                    <ArrowIconFive />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* === Services List === */}
                <div className="row">
                    {servicesData.slice(36, 39).map((service, index) => (
                        <BusinessCServiceItem {...service} key={index} />
                    ))}
                </div>
                {/* === Footer Text === */}
                <div className="row">
                    <div className="col-lg-12">
                        <div
                            className="bnc-service-text text-center mt-30 tp_fade_anim"
                            data-delay=".3"
                        >
                            <p>
                                <Image width={85} height={50} src="/assets/img/business-consulting/service/service-thumb.png" alt="service thumb" /> Partnering with you
                                to transform your vision into reality :{' '}
                                <Link href="/contact-us">Contact Us</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessConsultingService;
