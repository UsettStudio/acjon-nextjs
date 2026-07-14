import SetupAgencyAwardItem from './subComponents/SetupAgencyAwardItem';
import awardData from '@/data/awardData';
import Image from 'next/image';

const StartupAgencyAward = () => {
    return (
        <div className="sa-award-ptb pt-200 pb-160">
            <div className="container container-1510">
                {/* Title Section */}
                <div className="row align-items-end">
                    <div className="col-lg-8">
                        <div className="sa-award-title-box mb-60">
                            <h3
                                className="tp-section-title fs-52 tl-unbounded fw-500 tp-text-revel tp_fade_anim"
                                data-delay=".3"
                            >
                                One of the Best Digital <br />
                                Agencies of the Year.
                            </h3>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div
                            className="sa-award-right-text text-lg-end mb-65 tp_fade_anim"
                            data-delay=".4"
                        >
                            <p>{`//2016 -2025`}</p>
                        </div>
                    </div>
                </div>

                {/* Award Section */}
                <div className="row">
                    <div className="col-lg-4">
                        <div className="sa-award-thumb tp_fade_anim" data-delay=".4">
                            <Image
                                width={310}
                                height={393}
                                src="/assets/img/startup-agancy/award/award-thumb-1.png"
                                alt="award thumb"
                            />
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div
                            className="sa-award-item-wrapper tp_fade_anim"
                            data-delay=".5"
                        >
                            {awardData.slice(12, 17).map((item, index) => (
                                <SetupAgencyAwardItem {...item} key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartupAgencyAward;
