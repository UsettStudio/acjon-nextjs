import CreativeAgencyTeamItem from './subComponents/CreativeAgencyTeamItem';
import { ButtonArrowIconTwo } from '@/svg';
import teamMembers from '@/data/teamData';
import Link from 'next/link';

const CreativeAgencyTeam = () => {
    return (
        <div className="ca-team-ptb pt-180 pb-105">
            <div className="container">
                <div className="row align-items-end">
                    <div className="col-lg-8">
                        <div className="ca-team-text-box mb-60">
                            <span className="tp-section-subtitle title-white tp-split-title">{`// Our Team`}</span>
                            <h3 className="tp-section-title tl-unbounded title-white tp-split-title">
                                Meet Our Innovative <br /> team members
                            </h3>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div
                            className="ca-team-btn text-lg-end mb-60 tp_fade_anim"
                            data-delay=".5"
                            data-fade-from="top"
                            data-ease="bounce"
                        >
                            <Link className="tp-btn-green btn-white-bg tp-btn-anim" href="/team">
                                <div className="tp-btn-text">Team Members</div>
                                <span>
                                    <ButtonArrowIconTwo />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="ca-team-wrapper">
                    <div className="row">
                        {teamMembers.slice(8, 11).map((member, index) => (
                            <CreativeAgencyTeamItem {...member} key={index} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreativeAgencyTeam;
