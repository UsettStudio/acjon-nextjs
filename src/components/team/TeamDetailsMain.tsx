import { FacebookIconTwo, InstragramIconTwo, TwitorIcon } from '@/svg';
import CareerFunfact from '@/components/funfact/CareerFunfact';
import TeamBlog from '@/components/blog/TeamBlog';
import { PhoneIconFour } from '@/svg/PhoneIcons';
import { EmailIcon } from '@/svg/SocialIcons';
import { IdProps } from '@/types/custom-dt';
import teamMembers from '@/data/teamData';
import Image from 'next/image';
import Link from 'next/link';

const TeamDetailsMain = ({ id }: IdProps) => {
    // Find the team that matches the given ID
    const team = teamMembers.find((team) => team.id == id);
    
    return (
        <main>
            <div className="tp-team-details-ptb pt-200 pb-130">
                <div className="container container-1480">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="tp-team-details-thumb p-relative mb-30 tp_fade_anim" data-delay=".3">
                                <Image className='img-fluid' width={716} height={804} src={team?.image || ''} alt="team details image" />
                                <div className="tp-team-details-social">
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
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="tp-team-details-wrapper tp_fade_anim" data-delay=".5">
                                <div className="tp-team-details-heading">
                                    <span className="tp-team-details-sub">{team?.role}</span>
                                    <h4 className="tp-team-details-title">{team?.name}</h4>
                                    <p>As an artist here to solve such issues, we successfully filed
                                        several mandamus cases on behalf of more than 250 artwork
                                        and their family members and had approved green cards
                                        within several months after filing a complaint.</p>
                                </div>
                                <div className="tp-team-details-progess mb-50">
                                    <h5 className="tp-team-details-title-2 mb-30">My Skills</h5>
                                    <div className="tp-progress-bar-item">
                                        <div className="tp-progress-bar-title d-flex justify-content-between">
                                            <label>UX Design</label>
                                            <span>75%</span>
                                        </div>
                                        <div className="tp-progress-bar">
                                            <div className="progress">
                                                <div
                                                    className="progress-bar wow slideInLeft"
                                                    data-wow-delay=".1s"
                                                    data-wow-duration="2s"
                                                    role="progressbar"
                                                    data-width="75%"
                                                    aria-valuenow={75}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    style={{ width: "75%" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tp-progress-bar-item">
                                        <div className="tp-progress-bar-title d-flex justify-content-between">
                                            <label>API Development</label>
                                            <span>82%</span>
                                        </div>
                                        <div className="tp-progress-bar">
                                            <div className="progress">
                                                <div
                                                    className="progress-bar wow slideInLeft"
                                                    data-wow-delay=".1s"
                                                    data-wow-duration="2s"
                                                    role="progressbar"
                                                    data-width="82%"
                                                    aria-valuenow={82}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    style={{ width: "82%" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tp-team-details-info mb-50">
                                    <h5 className="tp-team-details-title-2 mb-30">Experience</h5>
                                    <ul>
                                        <li>Legal employee business law firm (2019-2023)</li>
                                        <li>Research Assistant University of St.Gallen (2017-2019)</li>
                                        <li>Corporate Finance & Management (2013-2017)</li>
                                    </ul>
                                </div>
                                <div className="tp-team-details-contact">
                                    <Link href="tel:012345678"><span>
                                        <PhoneIconFour />
                                    </span>+(302) 555-0107</Link>

                                    <Link href="mailto:acjon@gmail.com"><span>
                                        <EmailIcon />
                                    </span>Acjon@studio.com</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Team Funfact area */}
            <CareerFunfact />
            {/*Team blog area */}
            <TeamBlog />
        </main>
    );
};

export default TeamDetailsMain;