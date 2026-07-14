import Image from 'next/image';
import React from 'react';

interface CommonBannerAreaProps {
    wrapClass?: string;
    subWrapClass?: string;
    bannerThumb: string;
}

const CommonBannerArea: React.FC<CommonBannerAreaProps> = ({
    wrapClass = '',
    subWrapClass = '',
    bannerThumb,
}) => {
    return (
        <div className={wrapClass}>
            <div className={subWrapClass}>
                <Image
                    width={1905}
                    height={1269}
                    className='img-fluid w-auto h-auto'
                    data-speed=".8"
                    src={bannerThumb}
                    alt="banner thumb"
                />
            </div>
        </div>
    );
};

export default CommonBannerArea;
