import DesignStudioTeamItem from './subComponents/DesignStudioTeamItem';
import teamMembers from '@/data/teamData';
import { ButtonArrowIcon } from '@/svg';
import Link from 'next/link';

const DesignStudioTeam = () => {
    return (
        <div className="ds-team-ptb pt-145 tp-fixed-title-wrap-3 pb-100">
            <div className="container container-1510">
                <div className="row">
                    {/* ==== Left Section ==== */}
                    <div className="col-lg-5">
                        <div className="ds-team-heading tp-fixed-title-3 pb-30">
                            <h3 className="tp-section-title tl-unbounded mb-20 tp-split-title">
                                Introducing our <br /> skilled team!
                            </h3>
                            <div className="tp_fade_anim" data-delay=".3">
                                <p>
                                    At our design studio, we blend creativity with strategy <br />
                                    cutting-edge digital solutions. From brand development to <br />
                                    interactive web experiences.
                                </p>
                            </div>
                            <div className="ds-team-btn pt-40 tp_fade_anim" data-delay=".6">
                                <Link
                                    className="tp-btn-green btn-h-60 tp-btn-anim"
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

                    {/* ==== Right Section ==== */}
                    <div className="col-lg-7">
                        <div className="ds-team-wrapper">
                            <div className="row">
                                {teamMembers.slice(11, 17).map((member, index) => (
                                    <DesignStudioTeamItem {...member} key={index} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignStudioTeam;
