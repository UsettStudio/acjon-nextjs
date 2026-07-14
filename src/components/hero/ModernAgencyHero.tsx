import { ArrowShapeIcon, ButtonArrowIcon, StarIconThirteen, TextShapeIcon } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const ModernAgencyHero = () => {
    return (
        <div className="ma-hero-area ma-hero-ptb ma-hero-overlay z-index-1 fix"
            style={{ backgroundImage: `url("/assets/img/modern-agency/hero/hero-1.jpg")` }}>
            <div className="ma-hero-shape" data-speed="1.1">
                <span><ArrowShapeIcon /></span>
            </div>
            <div className="container container-1530">
                <div className="row">
                    <div className="col-xl-7">
                        <div className="ma-hero-title-box tp_fade_anim" data-delay=".3">
                            <h2 className="ma-hero-title">
                                Modern <br />
                                <span className="d-flex align-items-center">
                                    <i><TextShapeIcon /></i>
                                    Agency
                                </span>
                            </h2>
                        </div>
                    </div>
                    <div className="offset-xxl-4 offset-xl-2 col-xxl-4 col-xl-4 col-lg-12">
                        <div className="ma-hero-content">
                            <div className="tp_fade_anim" data-delay=".4">
                                <p>
                                    We are more than just a digital agency
                                    we <br /> are your  strategic partner in crafting.
                                </p>
                            </div>
                            <div className="ma-hero-btn tp_fade_anim" data-delay=".5">
                                <Link href="/contact-us" className="tp-btn-green tp-btn-anim btn-h-60">
                                    <div className="tp-btn-text">lets talk</div>
                                    <span>
                                        <ButtonArrowIcon />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ma-hero-circle">
                <div className="dgm-hero-text-circle tp_fade_anim" data-delay=".3" data-duration="1" data-fade-from="top" data-ease="bounce">
                    <Link className="p-relative" href="#">
                        <span className="dgm-hero-text-shape">
                            <Image width={136} height={136} src="/assets/img/modern-agency/hero/hero-circle-shape.jpg" alt="hero shape" />
                        </span>
                        <span className="dgm-hero-icon">
                            <StarIconThirteen />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ModernAgencyHero;