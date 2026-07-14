import { projectDt } from '@/types/custom-dt';
import { ArrowIconSixteen } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectProps {
    item: projectDt;
}

const LawyerAgencyProjectItem: React.FC<ProjectProps> = ({ item }) => {
    return (
        <div className="lw-project-item mb-70">
            <div className="lw-project-thumb p-relative">
                <Link href="/project-details">
                    <Image className='img-fluid w-100 h-100' width={500} height={497} src={item.image} alt={item.title} />
                </Link>

                <Link className="lw-project-link" href="/project-details">
                    <span>
                        <ArrowIconSixteen />
                    </span>
                </Link>
            </div>

            <div className="lw-project-content">
                <h4 className="lw-project-title">
                    <Link className="tp-line-white" href="/project-details"
                        dangerouslySetInnerHTML={{ __html: item?.title }}
                    />
                </h4>
            </div>
        </div>
    );
};

export default LawyerAgencyProjectItem;
