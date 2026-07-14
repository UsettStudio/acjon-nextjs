import DigitalMProcessItem from './subComponents/DigitalMProcessItem';
import { ArrowIconThree } from '@/svg/ArrowIcon';
import servicesData from '@/data/serviceData';
import Link from 'next/link';

const DigitalMProcessArea = () => {
    return (
            <div className="dgm-step-ptb pt-120 pb-160" style={{ backgroundColor: "#F5F7F5" }}>
                <div className="container container-1510">
                    <div className="row justify-content-center">
                        <div className="col-xl-6">
                            <div className="dgm-step-title-box text-center mb-50">
                                <span className="tp-section-subtitle fs-13 st-unbounded st-dot st-border">Our Process</span>
                                <h4 className="tp-section-title tl-unbounded fs-42 tp-split-title">
                                    Our Proven Process <br /> for Success
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="dgm-step-wrapper">
                        <div className="row align-items-end gx-0">
                            {servicesData.slice(12, 16).map((item, index) => (
                                <DigitalMProcessItem {...item} key={index} />
                            ))}
                            <div className="col-xl-12">
                                <div
                                    className="dgm-step-btn-wrap d-flex align-items-center justify-content-center mt-55 tp_fade_anim"
                                    data-delay=".6"
                                >
                                    <p>{`That's`} how you {`don't`} stop until {`you're`} satisfied.</p>
                                    <Link className="tp-btn-border tp-btn-anim" href="/contact-us">
                                        <div className="tp-btn-text">Contact Us</div>
                                        <span>
                                            <ArrowIconThree />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default DigitalMProcessArea;
