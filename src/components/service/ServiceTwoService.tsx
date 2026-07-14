import HomeSingleServiceItem from "./subComponents/HomeSingleServiceItem";
import { ServiceTwoShapeIcon } from "@/svg/ShapeIcons";
import servicesData from "@/data/serviceData";

const ServiceTwoService = () => {
    return (
        <div className="tp-service-area tp-item-anime-area-md tp-fixed-title-wrap position-relative tp-about-dgm-ptb pt-120 pb-130">
            <span className="tp-service-inner-2-shape" data-speed="1.1">
               <ServiceTwoShapeIcon/>
            </span>
            <h2 className="tp-service-inner-2-bigtext tp-item-anime-md marque d-none d-lg-block">Our service</h2>
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-4">
                        <div className="tp-service-heading tp-service-inner-2-title tp-fixed-title mb-30">
                            <h3 className="tp-section-title mb-35 tp-split-title">Services we <br /> provide make</h3>
                            <span className="tp-section-subtitle tp_fade_anim" data-delay=".5">Our Services</span>
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="tp-service-item-box tp_fade_anim" data-delay=".5">
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

export default ServiceTwoService;