import Image from "next/image";

interface DescriptionFeature {
    title: string;
    description: string;
    image?: string;
};

interface DescriptionSection {
    title?: string;
    paragraphs: string[];
    image?: string;
};

const topSection: DescriptionSection = {
    title: "Big Screen Huge impact.",
    paragraphs: [
        "Third-generation optical heart sensor, Electrical heart sensor, Certified dust resistant, Improved accelerometer up to 32 g-forces, Improved gyroscope, Ambient light sensor, Always-On Retina LTPO OLED display with Force Touch (1000 nits)",
    ],
};

const featureSection: DescriptionFeature = {
    title: "",
    description:
        "The photo collection from your Memories is displayed in a unique mosaic grid, giving you a richer view of your library.",
    image:
        "/assets/img/shop/details/description/product-description-shape-1.png",
};

const middleSection: DescriptionSection = {
    title: "Smart home, smarter watch",
    paragraphs: [
        "Put your favourite photos of friends and family front and centre. Featuring a dynamic, multilayered effect, this new watch face uses Portrait mode photos from your iPhone to give the people you care about a starring role.",
        "The current status of all your devices is now conveniently displayed at the top of the Home app screen. Instantly see if your lights or cameras are on, whether your batteries are charged, or if your software needs updating.",
    ],
};

const galleryImages: string[] = [
    "/assets/img/shop/details/description/product-description-2.jpg",
    "/assets/img/shop/details/description/product-description-3.jpg",
];


const DescriptionContent = () => {
    return (
        <>
            {/* Section 1 */}
            <div className="row">
                <div className="col-lg-6">
                    <div className="product__details-description-content">
                        <h3 className="product-desc-title">{topSection.title}</h3>

                        {topSection.paragraphs.map((text, index) => (
                            <p key={index}>{text}</p>
                        ))}

                        <div className="product-desc-feature mt-40 mb-40 d-sm-flex align-items-start">
                            <div className="product-desc-feature-thumb mr-25">
                                {
                                    featureSection.image && (
                                       <Image className="img-fluid w-auto h-auto" width={60} height={71} src={featureSection.image} alt="Feature" />
                                    )
                                }
                            </div>
                            <div className="product-desc-feature-content">
                                <p>{featureSection.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="product__details-description-thumb m-img">
                        <Image className="img-fluid w-auto h-auto" width={651} height={402} src="/assets/img/shop/details/description/product-description-1.jpg"
                            alt="Product description"
                        />
                    </div>
                </div>
            </div>

            {/* Section 2 */}
            <div className="row">
                <div className="col-lg-12">
                    <div className="product__details-description-content">
                        <h3 className="product-desc-title">{middleSection.title}</h3>
                    </div>
                </div>

                {middleSection.paragraphs.map((text, index) => (
                    <div key={index} className="col-lg-6">
                        <div className="product__details-description-content pr-30 mb-40">
                            <p>{text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Section 3 – Gallery */}
            <div className="row align-self-end">
                {galleryImages.map((img, index) => (
                    <div key={index} className="col-md-6">
                        <div className="product__details-description-thumb m-img">
                            <Image width={570} height={581} className="img-fluid w-auto h-auto" src={img} alt={`Gallery ${index + 1}`} />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default DescriptionContent;