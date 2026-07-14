import { FacebookIconTwo, InstragramIconTwo, PlusIcon, TwitorIconTwo } from '@/svg';
import { teamMemberDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const CommonTeamCard: React.FC<teamMemberDt> = ({ id, delay, image, name, role }) => {
    return (
        <div
            className="tp-team-item p-relative mb-30 tp_fade_anim"
            data-delay={delay}
        >
            <div className="tp-team-thumb">
                <Image className='img-fluid w-100 h-auto' width={354} height={461} src={image} alt={name} />
            </div>
            <div className="tp-team-content">
                <h4 className="tp-team-title">
                    <Link href={`/team-details/${id}`} className="tp-line-black">
                        {name}
                    </Link>
                </h4>
                <span>{role}</span>
            </div>

            <div className="tp-team-social">
                <span className="tp-team-social-link">
                    <PlusIcon />
                </span>
                <div className="tp-team-social-icon">
                    <Link href="#">
                        <span><FacebookIconTwo /></span>
                    </Link>
                    <Link href="#">
                        <span><TwitorIconTwo /></span>
                    </Link>
                    <Link href="#">
                        <span><InstragramIconTwo /></span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CommonTeamCard;