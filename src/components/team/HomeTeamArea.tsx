import CommonTeamCard from './subComponents/CommonTeamCard';
import teamMembers from '@/data/teamData';
import { ButtonArrowIcon } from '@/svg';
import Link from 'next/link';

const HomeTeamArea = () => {
    return (
        <div className="tp-team-ptb pt-150 pb-120">
            <div className="container container-1510">
                <div className="tp-team-top-wrap mb-55">
                    <div className="row align-items-end">
                        <div className="col-xl-6 col-lg-8">
                            <div className="tp-team-title-box">
                                <span className="tp-section-subtitle tp-split-title">{`// Our Team`}</span>
                                <h3 className="tp-section-title mb-0 tp-split-title">
                                    Introducing our <br /> skilled team!
                                </h3>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-4">
                            <div
                                className="tp-team-btn text-lg-end tp_fade_anim"
                                data-delay=".5"
                                data-duration="1"
                                data-fade-from="top"
                                data-ease="bounce"
                            >
                                <Link
                                    className="tp-btn-green btn-black-bg tp-btn-anim btn-h-60"
                                    href="/team"
                                >
                                    <div className="tp-btn-text">Join Our Team</div>
                                    <span>
                                        <ButtonArrowIcon />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {teamMembers.slice(0, 4).map((member, index) => (
                        <div key={index} className="col-xxl-3 col-xl-4 col-md-6">
                            <CommonTeamCard {...member}/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeTeamArea;
