import { ButtonArrowIcon } from "@/svg";
import { ServiceItemDt } from "@/types/custom-dt";
import Link from "next/link";

interface ServicePropsDt {
    service: ServiceItemDt
}

const AboutServiceItem: React.FC<ServicePropsDt> = ({ service }) => {
    const Icon = service.svgIcon;

    return (
        <div className="sa-service-item p-relative mb-30">
            {Icon && (
                <div className="sa-service-item-icon">
                    <span>
                        <Icon/>
                    </span>
                </div>
            )}
            <div className="sa-service-item-content">
                <h4 className="sa-service-item-title">
                    <Link className="tp-line-white" href={`/service-details/${service.id}`}>
                        {service.title}
                    </Link>
                </h4>

                <p>{service.description}</p>

                <div className="ds-service-item-btn tp-btn-anim">
                    <Link href={`/service-details/${service.id}`}>
                        <div className="tp-btn-text">Read More</div>
                        <span className="ds-service-item-btn-icon">
                            <ButtonArrowIcon />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutServiceItem;
