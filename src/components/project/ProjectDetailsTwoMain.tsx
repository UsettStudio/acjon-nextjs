import PrevNextProject from '@/components/project/subComponents/PrevNextProject';
import projectData from '@/data/projectData';
import { IdProps } from '@/types/custom-dt';
import { ArrowIconTwo } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const ProjectDetailsTwoMain = ({ id }: IdProps) => {
    // Find the service that matches the given ID
    const project = projectData.find((project) => project.id == id);

    return (
        <main>
            {/* Project Details Area Start */}
            <div className="tp-project-details-area pt-200 pb-140">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-xxl-8 col-xl-7 col-lg-6">
                            <div className="tp-project-details-2-top mb-30">
                                <h2 className="tp-project-details-2-title tp-split-title"> Possibilities<br /> <span className="ml-100 d-inline-block">Workshop.</span></h2>
                            </div>
                        </div>
                        <div className="col-xxl-4 col-xl-5 col-lg-6">
                            <div className="tp-project-details-shedule mr-80">
                                <ul>
                                    <li>
                                        <span>Category</span>
                                        {project?.category || "UI/UX Design"}
                                    </li>
                                    <li>
                                        <span>Client Name</span>
                                        Mr. Daniel Shami
                                    </li>
                                    <li>
                                        <span>Industry</span>
                                        Technology & Software
                                    </li>
                                    <li>
                                        <span>Launch Date</span>
                                        {project?.date || "25th March 2023"}
                                    </li>
                                </ul>
                                <Link href="/project-details-2" className="tp-project-details-shedule-btn">
                                    <span className="mr-5">View This Project</span>{" "}
                                    <span className="tp-arrow-angle">
                                        <ArrowIconTwo />
                                    </span>
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-12">
                            <div className="tp-project-details-banner tp-project-details-banner-2 mb-115">
                                <Image width={1486} height={1121} data-speed="0.8" className="img-fluid w-100" src="/assets/img/inner-image/project/details/banner-2.jpg" alt="banner image" />
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="tp-project-details-2-title-wrap mb-30">
                                <h2 className="tp-section-title tl-unbounded fs-42 text-capitalize ">Shape, refine, and
                                    evolve together with
                                    powerful solutions.</h2>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-7">
                            <div className="tp-project-details-2-content mb-30">
                                <p>You need the best person for the job, wherever they&apos;re located. We provide
                                    support, payroll tax management, and compliance management for remote multi
                                    multi-location, and international employees.</p>
                                <p className="mb-40">You need the best person for the job, wherever they&apos;re located. We provide
                                    support, payroll tax management, and compliance management for remote multi
                                    multi-location, and international employees.</p>
                                <div className="tp-project-details-2-list">
                                    <h4 className="mb-15">Challenge We Faced.</h4>
                                    <ul>
                                        <li>+ Client-Centered Legal Solutions</li>
                                        <li>+ Community Advocacy</li>
                                        <li>+ Results-Driven Representation</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-12">
                            <div className="tp-project-details-banner mt-40 mb-115">
                                <Image width={1486} height={1124} data-speed="0.8" className="img-fluid w-100" src="/assets/img/inner-image/project/details/banner-3.jpg" alt="banner image" />
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="tp-project-details-2-title-wrap mb-30">
                                <h2 className="tp-section-title tl-unbounded fs-42 tp-split-title">Project Outcome</h2>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-7">
                            <div className="tp-project-details-2-content mb-70">
                                <p>You need the best person for the job, wherever they&apos;re located. We provide
                                    support, payroll tax management, and compliance management for remote multi
                                    multi-location, and international employees.</p>
                                <p className="mb-50">You need the best person for the job, wherever they&apos;re located. We provide
                                    support, payroll tax management, and compliance management for remote multi
                                    multi-location, and international employees.</p>
                                <div className="tp-project-details-2-bost d-flex gap-3 flex-wrap">
                                    <span><b className="tp-text-common-black">45%</b> increase in<br /> conversion</span>
                                    <span><b className="tp-text-common-black">30%</b> boost <br />in organic traffic</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="tp-project-details-2-thumb mb-30">
                                <Image width={731} height={654} className="img-fluid w-100" data-speed="0.8" src="/assets/img/inner-image/project/details/thumb-4.jpg" alt="thumb image" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="tp-project-details-2-thumb mb-30">
                                <Image width={731} height={654} className="img-fluid w-100" data-speed="0.8" src="/assets/img/inner-image/project/details/thumb-5.jpg" alt="thumb image" />
                            </div>
                        </div>
                    </div>
                    {/* prev next project */}
                    <PrevNextProject paddingSpacingCls="pt-40" />
                </div>
            </div>
        </main>
    );
};

export default ProjectDetailsTwoMain;