import Image from 'next/image';
import React from 'react';

const projectThumbs = [
    {
        src: '/assets/img/inner-image/project/details/thumb.jpg',
        alt: 'Project detail thumbnail 1',
    },
    {
        src: '/assets/img/inner-image/project/details/thumb-2.jpg',
        alt: 'Project detail thumbnail 2',
    },
    {
        src: '/assets/img/inner-image/project/details/thumb-3.jpg',
        alt: 'Project detail thumbnail 3',
    },
];

const ProjectDetailsThumb: React.FC = () => {
    return (
        <div className="row">
            {projectThumbs.map((item, index) => (
                <div key={index} className="col-lg-4 col-md-6 col-sm-6">
                    <div className="tp-project-details-thumb mb-30">
                        <Image className='img-fluid w-100 h-100' width={420} height={410} src={item.src} alt={item.alt} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectDetailsThumb;
