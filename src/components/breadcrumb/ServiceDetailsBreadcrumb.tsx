import Image from "next/image";
import { ServiceTwoShapeIcon } from "@/svg/ShapeIcons";
import { BreadcrumbTriangle } from "@/svg";

interface ServiceDetailsBreadcrumbProps {
    title?: string;
    highlightImage?: string;
    subtitle?: string;
    description?: string;
    features?: string[];
}

const ServiceDetailsBreadcrumb = ({
    title = "Custom Website Design & Full-Stack.",
    highlightImage = "/assets/img/breadcrumb/thumb.png",
    subtitle = "Services Us",
    description = `We are seeking a Product Designer to join our team at Acjon. In this role,
    you will help craft the visual and interactive elements of our software products,
    ensuring a seamless and intuitive user experience. You will collaborate with our
    product and development.`,
    features = [
        "Client-Centered Legal Solutions",
        "Client-Centered Legal Solutions",
        "Results-Driven Representation",
        "Results-Driven Representation",
        "Community Advocacy",
        "Community Advocacy",
    ],
}: ServiceDetailsBreadcrumbProps) => {
    return (
        <section className="tp-breadcrumb-s7-ptb position-relative">
            {/* Decorative Shape */}
            <span
                className="tp-breadcrumb-s7-shape d-none d-xl-block"
                data-speed=".9"
            >
                <ServiceTwoShapeIcon />
            </span>

            <div className="container">
                <div className="row">
                    {/* Title */}
                    <div className="col-lg-12">
                        <div className="tp-breadcrumb-s7-title-wrap mb-25">
                            <h4 className="tp-breadcrumb-s7-title tp-split-title">
                                {title.replace("& Full-Stack.", "")}
                                <br />{" "}
                                <Image
                                    src={highlightImage}
                                    alt="breadcrumb highlight"
                                    width={199}
                                    height={77}
                                    className="tp_fade_anim img-fluid"
                                    data-delay=".3"
                                />
                                {"& Full-Stack."}

                                <span className="ml-30 tp_fade_anim" data-delay=".5">
                                    <BreadcrumbTriangle />
                                </span>
                            </h4>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="col-xl-9 offset-xl-2">
                        <div className="tp-breadcrumb-s7-content-wrap">
                            <div className="row">
                                <div className="col-lg-3">
                                    <div
                                        className="tp-breadcrumb-s7-subtitle tp_fade_anim"
                                        data-delay=".5"
                                    >
                                        <div className="tp-breadcrumb-s1-subtitle">
                                            {subtitle}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-9">
                                    <div
                                        className="tp-breadcrumb-s7-content tp_fade_anim"
                                        data-delay=".7"
                                    >
                                        <p className="mb-30">{description}</p>

                                        <div className="tp-breadcrumb-s7-list">
                                            <ul>
                                                {features.map((item, index) => (
                                                    <li key={index}>+ {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServiceDetailsBreadcrumb;
