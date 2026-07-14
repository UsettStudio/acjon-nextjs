import { FacebookIconTwo, InstragramIconTwo, TwitorIcon } from '@/svg';
import { teamMemberDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const CreativeAgencyTeamItem: React.FC<teamMemberDt> = ({ id, delay, image, name, role }) => {
    return (
        <div className="col-lg-4">
            <div
                className="ds-team-item mb-50 tp_fade_anim"
                data-delay={delay}
            >
                <div className="ds-team-item-thumb p-relative">
                    <div className="ds-team-item-thumb-badge">
                        <Image width={81} height={79} src="/assets/img/creative-agency/team/team-shape.jpg" alt="badge" />
                    </div>
                    <Link href={`/team-details/${id}`}>
                        <Image className='img-fluid w-100 h-auto' width={426} height={471} src={image} alt={name} />
                    </Link>
                    <div className="tp-team-social-icon">
                        <Link href="#">
                            <span><FacebookIconTwo /></span>
                        </Link>
                        <Link href="#">
                            <span><TwitorIcon /></span>
                        </Link>
                        <Link href="#">
                            <span><InstragramIconTwo /></span>
                        </Link>
                    </div>
                </div>
                <div className="ds-taem-item-content">
                    <h3 className="ds-team-item-title">
                        <Link className="tp-line-black" href={`/team-details/${id}`}>
                            {name}
                        </Link>
                    </h3>
                    <span className="ds-team-item-sub">{role}</span>
                </div>
            </div>
        </div>
    );
};

export default CreativeAgencyTeamItem;