import Image from "next/image";

const CareerBanner = () => {
    return (
        <div className="tp-about-banner-ptb">
            <div className="sa-banner-wrapper p-relative">
                <Image width={1905} height={1139} data-speed=".8" src="/assets/img/inner-image/about/about-banner-6.jpg" alt="banner image"/>
            </div>
        </div>
    );
};

export default CareerBanner;