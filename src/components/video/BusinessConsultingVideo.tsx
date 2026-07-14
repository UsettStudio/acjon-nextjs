"use client";
import { VideoPlayIconThree } from '@/svg/VideoPlayIcons';
import { useVideoModal } from '@/provider/VideoProvider';
import { ArrowIconFive } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const BusinessConsultingVideo = () => {
    const { playVideo } = useVideoModal();

    return (
        <div className="bnc-video-area bnc-video-ptb p-relative mb-120">
            <div className="bnc-video-thumb">
                <Image width={1905} height={950} data-speed=".7" src="/assets/img/business-consulting/video/video-thumb.jpg" alt="video thumb" />
            </div>
            <div className="bnc-video-thumb-btn">
                <button onClick={() => playVideo("VCPGMjCW0is")} className="dgm-hero-play-btn popup-video video-animetion">
                    <i><VideoPlayIconThree /></i>
                </button>
            </div>
            <div className="bnc-video-item">
                <div className="bnc-video-item-icon">
                    <Image width={58} height={50} src="/assets/img/business-consulting/video/video-icon.png" alt="video icon" />
                </div>
                <div className="bnc-video-item-content">
                    <p>We offer exclusive
                        deals and special offers
                        tailored for our valued
                        customers</p>
                </div>
                <div className="bnc-video-item-btn">
                    <Link className="tp-btn-anim" href="/about">
                        <div className="tp-btn-text">Explore More</div>
                        <span>
                            <ArrowIconFive fillColor='#C9F31D' />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BusinessConsultingVideo;