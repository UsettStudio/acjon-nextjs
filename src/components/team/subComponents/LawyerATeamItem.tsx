import { teamMemberDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const LawyerATeamItem: React.FC<teamMemberDt> = ({ id, name, role, image }) => {
    return (
        <div className="tp-team-item p-relative mb-30">
            <div className="tp-team-thumb">
                <Image className='img-fluid w-100 h-100' width={459} height={525} src={image} alt={name} />
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

export default LawyerATeamItem;