import { FacebookIconTwo, InstragramIconTwo, TwitorIconTwo } from '@/svg';
import { teamMemberDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const DesignStudioTeamItem: React.FC<teamMemberDt> = ({ id, delay, image, name, role }) => {
    return (
        <div className="col-md-6">
            <div
                className="ds-team-item mb-50 tp_fade_anim"
                data-delay={delay}
            >
                <div className="ds-team-item-thumb p-relative">
                    <Link href={`/team-details/${id}`}>
                        <Image
                            className='img-fluid w-100 h-auto'
                            width={351}
                            height={421}
                            src={image}
                            alt={`${name} image`}
                        />
                    </Link>
                    <div className="tp-team-social-icon">
                        <Link href="#">
                            <span>
                                <FacebookIconTwo />
                            </span>
                        </Link>
                        <Link href="#">
                            <span>
                                <TwitorIconTwo />
                            </span>
                        </Link>
                        <Link href="#">
                            <span>
                                <InstragramIconTwo />
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="ds-taem-item-content text-center">
                    <h3 className="ds-team-item-title">
                        <Link className="tp-line-black"
                            href={`/team-details/${id}`}>
                            {name}
                        </Link>
                    </h3>
                    <span className="ds-team-item-sub">{role}</span>
                </div>
            </div>
        </div>
    );
};

export default DesignStudioTeamItem;