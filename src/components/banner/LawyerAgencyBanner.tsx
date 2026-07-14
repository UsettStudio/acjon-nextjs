import Image from 'next/image';

const LawyerAgencyBanner = () => {
    return (
        <div className="lw-banner-area">
            <div className="container-fluid">
                <div className="lw-banner-wrapper fix">
                    <Image width={1801} height={900} data-speed=".7" src="/assets/img/lawyer-agency/banner/banner-1.jpg" alt="banner image" />
                </div>
            </div>
        </div>
    );
};

export default LawyerAgencyBanner;