import { ArrowIconFifteen } from '@/svg/ArrowIcon';
import { StarIconTwelve } from '@/svg/StarIcons';
import Image from 'next/image';

const LawyerAgencyHero = () => {
    return (
        <div className="lw-hero-ptb pb-150 p-relative fix z-index-1">
            <span className="lw-hero-circle-1"></span>
            <div className="lw-hero-shape">
                <Image width={224} height={149} className="lw-hero-shape-1" src="/assets/img/lawyer-agency/lawyer-1.png" alt="lawyer image" />
                <Image width={136} height={136} className="lw-hero-shape-2" src="/assets/img/lawyer-agency/lawyer-2.png" alt="lawyer image" />
            </div>
            <div className="container container-1600">
                <div className="row align-items-end">
                    <div className="col-xl-8">
                        <div className="lw-hero-title-box p-relative">
                            <h4 className="lw-hero-title tp_fade_anim" data-delay=".3">
                                Fighting for <i>Justice winning</i> for you.{" "}
                                <span className="z-index-1">
                                    <ArrowIconFifteen />
                                </span>
                            </h4>
                            <div className="tp_fade_anim" data-delay=".5">
                                <p>
                                    With a team of experienced attorneys, we provide <br />
                                    strategic legal solutions tailored.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-4">
                        <div className="lw-hero-review-wrap d-flex justify-content-xl-end">
                            <div className="lw-hero-review-box tp_fade_anim" data-delay=".7">
                                <span>4.8</span>
                                <div className="lw-hero-review-icon">
                                    <i>
                                        <StarIconTwelve />
                                    </i>{" "}
                                    <i>
                                        <StarIconTwelve />
                                    </i>{" "}
                                    <i>
                                        <StarIconTwelve />
                                    </i>{" "}
                                    <i>
                                        <StarIconTwelve />
                                    </i>{" "}
                                    <i>
                                        <StarIconTwelve />
                                    </i>
                                </div>
                                <p>
                                    2500+ Reviews based on <br />
                                    clients feedback
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerAgencyHero;