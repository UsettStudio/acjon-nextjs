import Image from "next/image";

interface BrandItem {
    id: number;
    title: string;
    image: string;
    width: number;
}

const brandData: BrandItem[] = [
    { id: 1, title: "Organic", image: "/assets/img/inner-image/brand/logo.png", width: 174 },
    { id: 2, title: "Natural", image: "/assets/img/inner-image/brand/logo-2.png", width: 112 },
    { id: 3, title: "Cuebe", image: "/assets/img/inner-image/brand/logo-3.png", width: 103 },
    { id: 4, title: "Microwave", image: "/assets/img/inner-image/brand/logo-4.png", width: 190 },
    { id: 5, title: "Marland", image: "/assets/img/inner-image/brand/logo-5.png", width: 133 },
    { id: 6, title: "Alisa", image: "/assets/img/inner-image/brand/logo-6.png", width: 64 },
    { id: 7, title: "Newage", image: "/assets/img/inner-image/brand/logo-7.png", width: 112 },
    { id: 8, title: "Rose", image: "/assets/img/inner-image/brand/logo-8.png", width: 70 },
];

const ServiceTwoBrand = () => {
    return (
        <section className="ds-brand-area tp-about-dgm-ptb pt-155 pb-65">
            <div className="container container-1510">
                <div className="row">
                    {/* Heading */}
                    <div className="col-12">
                        <div className="tp-brand-heading mb-55">
                            <span
                                className="tp-section-subtitle tp_fade_anim"
                                data-delay=".3"
                            >
                                {`// Our clients`}
                            </span>
                            <h3 className="tp-section-title fs-52 tp-split-title">
                                Who we work with
                            </h3>
                        </div>
                    </div>

                    {/* Brand Items */}
                    {brandData.map(({ id, title, image, width }) => (
                        <div key={id} className="col-lg-3 col-md-4 col-sm-6">
                            <div className="inner-brand-item mb-30">
                                <span className="inner-brand-count">
                                    {id}. {title}
                                </span>
                                <Image src={image} alt={title} width={width} height={30} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServiceTwoBrand;
