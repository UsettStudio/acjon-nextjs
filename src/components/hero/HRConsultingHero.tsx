"use client";
import HRConsultingFeatureItem from './subComponents/HRConsultingFeatureItem';
import { useVideoModal } from '@/provider/VideoProvider';
import { VideoPlayIconFive } from '@/svg';
import Image from 'next/image';

const HRConsultingHero = () => {
    const { playVideo } = useVideoModal();

    return (
        <div className="hr-hero-bg include-bg z-index-1 hero-section" style={{ backgroundImage: `url(/assets/img/hr-consulting/hero-1.jpg)` }} >
            <div className="hr-hero-main d-flex flex-column justify-content-between h-100">
                <div className="hr-hero-content pl-160">
                    <div className="row gx-0">
                        <div className="col-xl-10 offset-xl-2">
                            <div className="row align-items-end">
                                <div className="col-lg-9">
                                    <div className="hr-hero-title-box">
                                        <span className="hr-hero-subtitle d-flex align-items-center tp_fade_anim" data-delay=".3">
                                            <i><Image width={60} height={9} src="/assets/img/hr-consulting/logo-sm.png" alt="logo small" /></i>
                                            Powerful bonds within teams
                                        </span>
                                        <h4 className="hr-hero-title tp-split-title">HR Solutions <br /> For A Thriving</h4>
                                    </div>
                                </div>
                                <div className="col-lg-3">
                                    <div className="hr-hero-play-btn-wrap mb-35">
                                        <button onClick={() => { playVideo("VCPGMjCW0is") }} className="hr-hero-play-btn popup-video video-animetion">
                                            <span>
                                                <VideoPlayIconFive width='24' height='28' fillColor='#010103' />
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row gx-0">
                    <div className="col-xl-10 offset-xl-2">
                        <div className="hr-feature-wrap pl-100">
                            <HRConsultingFeatureItem />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRConsultingHero;