import HomeSingleServiceItem from './subComponents/HomeSingleServiceItem';
import servicesData from '@/data/serviceData';
import { ButtonArrowIcon } from '@/svg';
import Link from 'next/link';

const HomeService = () => {
    return (
        <div className="tp-service-area tp-fixed-title-wrap pt-40 pb-130">
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-4">
                        <div className="tp-service-heading mb-30 tp-fixed-title">
                            <span className="tp-section-subtitle tp-split-title">{`// latest Services`}</span>
                            <h3 className="tp-section-title mb-45 tp-split-title">The services <br /> we provide make</h3>
                            <div className="tp-service-btn tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                <Link className="tp-btn-green btn-black-bg tp-btn-anim btn-h-60" href="/service">
                                    <div className="tp-btn-text">See All Services </div>
                                    <span>
                                        <ButtonArrowIcon />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="tp-service-item-box">
                            <div className="row">
                                {servicesData.slice(0, 6).map((service, index) => (
                                    <div key={index} className="col-lg-6">
                                        <HomeSingleServiceItem service={service} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeService;