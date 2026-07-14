import Image from "next/image";

const AboutMeBanner = () => {
    return (
        <div className="tp-career-inner-banner-ptb p-relative">
            <div className="sa-banner-wrapper p-relative">
                <Image width={1905} height={1246} data-speed=".8" src="/assets/img/inner-image/about-me/banner-thumb.jpg" alt="banner thumb"/>
            </div>
        </div>
    );
};

export default AboutMeBanner;