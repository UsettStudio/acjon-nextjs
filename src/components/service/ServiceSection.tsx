import HomeSingleServiceItem from "./subComponents/HomeSingleServiceItem";
import servicesData from "@/data/serviceData";

const ServiceSection = () => {
    return (
        <div
            id="b"
            className="tp-service-area tp-service-inner-wrap tp-about-dgm-ptb pt-160 pb-130"
        >
            <div className="container">
                <div className="row">
                    {servicesData.slice(64, 73).map((service, index) => (
                        <div key={index} className="col-lg-4">
                            <HomeSingleServiceItem service={service} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiceSection;
