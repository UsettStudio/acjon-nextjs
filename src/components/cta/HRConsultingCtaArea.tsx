import { ArrowIconSeven } from '@/svg/ArrowIcon';
import { TextLogoIconThree } from '@/svg';
import Link from 'next/link';

const HRConsultingCtaArea = () => {
    return (
        <div className="hr-cta-bg include-bg pt-120 pb-120 z-index-1" style={{ backgroundImage: `url(/assets/img/hr-consulting/cta/cta-1.jpg)` }}>
            <div className="row justify-content-center">
                <div className="col-xxl-6 col-lg-8 col-12">
                    <div className="hr-cta-content text-center">
                        <div className="hr-cta-icon-box d-inline-flex align-items-center justify-content-center tp_fade_anim" data-delay=".3">
                            <span>
                                <TextLogoIconThree />
                            </span>
                            <p className="mb-0">Let&apos;s make something great work together.</p>
                        </div>
                        <h4 className="tp-section-title tl-spacegro text-case-int text-white mb-50 tp-split-title">We craft innovative solutions for businesses!</h4>
                        <div className="tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                            <Link href="/contact-us" className="tp-btn-green btn-h-60 br-8 tp-btn-anim">
                                <div className="tp-btn-text">Got A Project In Mind</div>
                                <span>
                                    <ArrowIconSeven />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRConsultingCtaArea;