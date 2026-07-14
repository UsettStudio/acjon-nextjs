import Image from 'next/image';

const ServiceBanner = () => {
    return (
        <div className="tp-about-banner-ptb">
            <div className="sa-banner-wrapper p-relative">
                <Image className='img-fluid w-auto h-auto' width={1905} height={1269} data-speed=".8" src="/assets/img/inner-image/about/about-banner-4.jpg" alt="banner Image"/>
            </div>
        </div>
    );
};

export default ServiceBanner;