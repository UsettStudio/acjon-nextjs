import { teamMemberDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const HRConsultingTeamItem: React.FC<teamMemberDt> = ({ id, image, name, role }) => {
    return (
        <div className="tp-team-item p-relative mb-30">
            <div className="tp-team-thumb">
                <Image className='img-fluid w-100 h-auto' width={402} height={524} src={image} alt={name} />
            </div>
            <div className="tp-team-content text-center">
                <h4 className="tp-team-title">
                    <Link className="tp-line-white" href={`/team-details/${id}`}>
                        {name}
                    </Link>
                </h4>
                <span>{role}</span>
            </div>
        </div>
    );
};

export default HRConsultingTeamItem;