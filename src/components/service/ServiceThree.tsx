import Image from "next/image";
import Link from "next/link";

interface ServiceItem {
    id: number;
    theme: "black" | "grey";
    title: string;
    href: string;
    description: string;
    features: string[];
    images: {
        large: string;
        small: string;
    };
}

const serviceData: ServiceItem[] = [
    {
        id: 1,
        theme: "black",
        title: "Ongoing Brand <br> Support & Digital.",
        href: "/service-details",
        description:
            "Crafted for Simplicity built for pros our Theme Builder empowers you to manage every static element.",
        features: [
            "Brand strategy",
            "Video production",
            "Research and testing",
            "Usability consulting",
            "Art direction",
            "Graphic design",
        ],
        images: {
            large: "/assets/img/inner-image/service/thumb.jpg",
            small: "/assets/img/inner-image/service/thumb-sm.jpg",
        },
    },
    {
        id: 2,
        theme: "grey",
        title: "Custom Website <br> Design & Full-Stack.",
        href: "/service-details",
        description:
            "Crafted for Simplicity built for pros our Theme Builder empowers you to manage every static element.",
        features: [
            "Brand strategy",
            "Video production",
            "Research and testing",
            "Usability consulting",
            "Art direction",
            "Graphic design",
        ],
        images: {
            large: "/assets/img/inner-image/service/thumb-2.jpg",
            small: "/assets/img/inner-image/service/thumb-sm-2.jpg",
        },
    },
    {
        id: 3,
        theme: "black",
        title: "Mobile App <br> Design & Development.",
        href: "/service-details",
        description:
            "Crafted for Simplicity built for pros our Theme Builder empowers you to manage every static element.",
        features: [
            "Brand strategy",
            "Video production",
            "Research and testing",
            "Usability consulting",
            "Art direction",
            "Graphic design",
        ],
        images: {
            large: "/assets/img/inner-image/service/thumb-3.jpg",
            small: "/assets/img/inner-image/service/thumb-sm-3.jpg",
        },
    },
];

const ServiceThree = () => {
    return (
        <section className="inner-service-3-area service-3-spacing inner-service-3-pin-wrap pb-60">
            {serviceData.map(
                ({ id, theme, title, href, description, features, images }) => (
                    <div
                        key={id}
                        className={`inner-service-3-item inner-service-3-panel pt-120 pb-130 ${theme === "black" ? "black-bg" : "grey-bg-2"
                            }`}
                    >
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="service-3-process-wrap mb-30">
                                        <div className="service-3-process-list">
                                            <span>{String(id).padStart(2, "0")}</span>
                                            <h2>
                                                <Link href={href} dangerouslySetInnerHTML={{__html:title}}/>
                                            </h2>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="service-3-process-content ml-90 mb-30">
                                        <p className="mb-30">{description}</p>
                                        <ul className="mb-55">
                                            {features.map((item, index) => (
                                                <li key={index}>+ {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="container container-1510">
                            <div className="row">
                                <div className="col-lg-8 mb-30">
                                    <div className="service-3-process-thumb">
                                        <Image
                                            src={images.large}
                                            alt={title}
                                            width={983}
                                            height={486}
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-4 mb-30">
                                    <div className="service-3-process-thumb">
                                        <Image
                                            src={images.small}
                                            alt={title}
                                            width={469}
                                            height={486}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </section>
    );
};

export default ServiceThree;
