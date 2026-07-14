
import CreativeAgencyTextSlider from '../text-slider/CreativeAgencyTextSlider';
import Image from 'next/image';

const ServiceBannerTwo = () => {
    return (
        <div className="tp-about-banner-ptb">
            <div className="sa-banner-wrapper p-relative">
                <Image
                    src="/assets/img/inner-image/about/about-banner-5.jpg"
                    className='img-fluid w-auto h-auto'
                    alt="About banner"
                    width={1905}
                    height={1269}
                    data-speed=".8"
                    priority
                />
                <CreativeAgencyTextSlider customClass='tp-text-slider-inner'/>
            </div>
        </div>
    );
};

export default ServiceBannerTwo;
