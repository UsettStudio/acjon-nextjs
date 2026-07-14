import { teamMemberDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const DigitalMarketingTeamItem: React.FC<teamMemberDt> = ({ id, image, name, role, delay }) => {
    return (
        <div className="col-xxl-3 col-lg-4 col-md-6" key={id}>
            <div
                className="dgm-team-item p-relative mb-30 tp_fade_anim"
                data-delay={delay}
            >
                <div className="dgm-team-thumb">
                    <Image style={{ width: "auto", height: "auto" }} width={353} height={458} src={image} alt={name} />
                </div>
                <div className="dgm-team-content">
                    <h4 className="dgm-team-title">
                        <Link className="tp-line-white" href={`/team-details/${id}`}>
                            {name}
                        </Link>
                    </h4>
                    <span>{role}</span>
                </div>
            </div>
        </div>
    );
};

export default DigitalMarketingTeamItem;