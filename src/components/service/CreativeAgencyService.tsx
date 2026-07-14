import CreativeAgencyServiceItem from './subComponents/CreativeAgencyServiceItem';
import { ButtonArrowIconTwo } from '@/svg/ArrowIcon';
import servicesData from '@/data/serviceData';
import Link from 'next/link';

const CreativeAgencyService = () => {
    return (
        <section className="ca-service-ptb pt-180 pb-140">
            <div className="container">
                {/* Section Header */}
                <div className="row align-items-end">
                    <div className="col-xxl-6 col-lg-8">
                        <div className="ca-service-text-box mb-60">
                            <span className="tp-section-subtitle title-white tp-split-title">{`// Our Services`}</span>
                            <h3 className="tp-section-title tl-unbounded title-white tp-split-title">
                                The services we <br /> provide make
                            </h3>
                        </div>
                    </div>
                    <div className="col-xxl-6 col-lg-4">
                        <div
                            className="ca-service-btn text-lg-end mb-60 tp_fade_anim"
                            data-delay=".5"
                            data-fade-from="top"
                            data-ease="bounce"
                        >
                            <Link className="tp-btn-green btn-white-bg tp-btn-anim" href="/service">
                                <div className="tp-btn-text">See All Services</div>
                                <span>
                                    <ButtonArrowIconTwo />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Services */}
                <div className="ca-service-item-box">
                    <div className="row">
                        {servicesData.slice(16, 19).map((item, index) => (
                            <CreativeAgencyServiceItem {...item} key={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CreativeAgencyService;
