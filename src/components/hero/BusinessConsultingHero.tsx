"use client";
import { useVideoModal } from '@/provider/VideoProvider';
import { VideoPlayIconFour } from '@/svg/VideoPlayIcons';
import Image from 'next/image';

const BusinessConsultingHero = () => {
    const { playVideo } = useVideoModal();

    return (
        <div className="bnc-hero-area z-index-2 include-bg bnc-hero-ptb"
            style={{ backgroundImage: `url(/assets/img/business-consulting/hero/hero-background.png)`, backgroundColor: "#073333" }}>
            <div className="container container-1510">
                <div className="row justify-content-center">
                    <div className="bnc-hero-title-box p-relative">
                        <span className="bnc-hero-subtitle tp_fade_anim" data-delay=".3">Business</span>
                        <h4 className="bnc-hero-title tp_fade_anim" data-delay=".5">Consu <br />
                            <span>lting</span>
                        </h4>
                        <div className="bnc-hero-info-wrap d-flex tp_fade_anim" data-delay=".5">
                            <div className="bnc-hero-info-thumb">
                                <a onClick={() => { playVideo("VCPGMjCW0is") }} className="popup-video p-relative">
                                    <Image className='h-auto' width={173} height={173} src="/assets/img/business-consulting/hero/hero-video-thumb.png" alt="video thumb" />
                                    <span>
                                        <VideoPlayIconFour />
                                    </span>
                                </a>
                            </div>
                            <div className="bnc-hero-info-content">
                                <p>Watch Video</p>
                                <span>01 Minutes 06 Seconds</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessConsultingHero;