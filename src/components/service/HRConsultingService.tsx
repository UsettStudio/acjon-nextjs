import HRConsultingServiceItem from './subComponents/HRConsultingServiceItem';
import { ShapeTitleLine } from '@/svg/ShapeIcons';
import servicesData from '@/data/serviceData';

const HRConsultingService = () => {
    return (
        <div
            className="hr-service-plr hr-spacing-plr pl-160 pr-160 pb-90 z-index-1"
            style={{ backgroundColor: '#fff' }}
        >
            {/* === Section Header === */}
            <div className="hr-service-top mb-60">
                <div className="row align-items-end">
                    <div className="col-xl-7">
                        <div className="hr-service-title-box">
                            <span
                                className="tp-section-subtitle st-dot st-border tp_fade_anim"
                                data-delay=".3"
                            >
                                Who we are
                            </span>
                            <h4 className="tp-section-title tl-spacegro text-case-int tp-split-title">
                                Tailored Solutions for <br /> Every{' '}
                                <span className="p-relative">
                                    Challenge.
                                    <ShapeTitleLine />
                                </span>
                            </h4>
                        </div>
                    </div>

                    <div className="col-xl-5">
                        <div className="hr-service-text tp_fade_anim" data-delay=".5">
                            <p>
                                Our dedication to quality over quantity has earned us the trust of
                                clients who value precision, authenticity, and excellence.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* === Service Items === */}
            <div className="row">
                {servicesData.slice(43, 46).map((service, index) => (
                    <HRConsultingServiceItem {...service} key={index} />
                ))}
            </div>
        </div>
    );
};

export default HRConsultingService;
