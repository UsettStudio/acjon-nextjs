import ImageHoverRevealProvider from '../provider/ImageHoverRevealProvider';
import DigitalMAwardItem from './subComponents/DigitalMAwardItem';
import awardData from '@/data/awardData';
import Image from 'next/image';

const DigitalMarketingAward = () => {
    return (
        <ImageHoverRevealProvider>
            <div className="dgm-award-area dgm-award-style pt-150 pb-160">
                <div className="container container-1510">
                    <div className="row justify-content-center">
                        <div className="col-xl-8">
                            <div className="dgm-award-title-box text-center mb-75">
                                <span className="tp-section-subtitle fs-13 st-unbounded st-dot st-border">
                                    Our Awards
                                </span>
                                <h4 className="tp-section-title tl-unbounded fs-42 tp-split-title">
                                    Celebrating Excellence <br /> in Creativity.
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div className="row gx-0">
                        <div className="col-xl-5 offset-xl-1 col-lg-6">
                            <div className="dgm-award-thumb tp-clip-anim">
                                <Image
                                    width={619}
                                    height={647}
                                    className="w-100 tp-anim-img"
                                    data-animate="true"
                                    src="/assets/img/digital-marketing/award/award-1.jpg"
                                    alt="award"
                                />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div
                                className="sa-award-item-wrapper z-index-1 tp_fade_anim"
                                data-delay=".3"
                            >
                                {awardData.slice(0, 6).map((award, index) => (
                                    <DigitalMAwardItem {...award} key={index} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ImageHoverRevealProvider>
    );
};

export default DigitalMarketingAward;
