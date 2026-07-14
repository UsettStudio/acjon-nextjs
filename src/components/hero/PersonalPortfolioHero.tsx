import { BehanceIconTwo, DribbbleIconThree, InstragramIconFive, TwitorIconFour } from '@/svg/SocialIcons';
import CommonBrandSlider from '../brand/CommonBrandSlider';
import { brand_slider_params } from '@/constants/swiper';
import { brandSliderData } from '@/data/brandData';
import { ArrowIconSix } from '@/svg/ArrowIcon';
import Image from 'next/image';
import Link from 'next/link';

const PersonalPortfolioHero = () => {
    return (
        <div className="tp-hero-port-wrap position-relative fix">
            <div className="container container-1510 h-100">
                <div className="row align-items-end h-100">
                    <div className="col-lg-5">
                        <div className="tp-hero-port-title-wrap mb-30">
                            <h2 className="tp-hero-port-title mb-45">Cassian<br /> Thor</h2>
                            <Link href="/contact-me" className="tp-header-port-btn">
                                lets talk{" "}
                                <span>
                                    <ArrowIconSix />
                                </span>
                            </Link>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="tp-hero-port-thumb">
                            <Image className='img-fluid w-100 h-100' width={819} height={819} src="/assets/img/port-slider/hero/thumb.png" alt="hero thumb" />
                        </div>
                    </div>
                    <div className="col-lg-3">
                        <div className="tp-hero-port-content ml-55 mb-30">
                            <div className="tp-about-me-hero-work mb-20">
                                <span>Open to work</span>
                            </div>
                            <div className="tp-about-me-hero-subtitle mb-25">
                                <h4>I am Creative<br />  designer based<br /> in London</h4>
                            </div>
                            <div className="tp-about-me-hero-social">
                                <Link href="#">
                                    <InstragramIconFive />
                                </Link>{" "}
                                <Link href="#">
                                    <TwitorIconFour />
                                </Link>{" "}
                                <Link href="#">
                                    <DribbbleIconThree />
                                </Link>{" "}
                                <Link href="#">
                                    <BehanceIconTwo />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tp-about-me-slider-ptb tp-hero-port-content-slide">
                <div className="tp-about-me-slider-wrapper">
                    <CommonBrandSlider
                        data={brandSliderData}
                        swiperParams={brand_slider_params}
                    />
                </div>
            </div>
        </div>
    );
};

export default PersonalPortfolioHero;