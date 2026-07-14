"use client";
import { useVideoModal } from '@/provider/VideoProvider';
import { VideoPlayIconFive } from '@/svg/VideoPlayIcons';
import Image from 'next/image';

const LawyerAgencyVideo = () => {
    const { playVideo } = useVideoModal();
    return (
        <div className="lw-video-wrap fix p-relative">
            <Image width={1905} height={950} data-speed=".7" src="/assets/img/lawyer-agency/video/video-1.jpg" alt="video image" />
            <button onClick={() => { playVideo("VCPGMjCW0is") }} className="lw-video-btn popup-video video-animetion">
                <span>
                    <VideoPlayIconFive fillColor='currentColor' />
                </span>
            </button>
        </div>
    );
};

export default LawyerAgencyVideo;