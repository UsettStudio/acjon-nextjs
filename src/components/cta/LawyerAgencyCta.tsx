import { ArrowIconSeven } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const LawyerAgencyCta = () => {
    return (
        <div className="lw-cta-area pb-120">
            <div className="container">
                <div className="lw-cta-bg p-relative">
                    <Image width={1326} height={150} className="lw-cta-img" src="/assets/img/lawyer-agency/cta/cta-bg.jpg" alt="cta image" />
                    <div className="row align-items-center">
                        <div className="col-xl-9">
                            <div className="lw-cta-text">
                                <p>Get expert guidance with a <Link href="/contact-us">free consultation</Link> today.</p>
                            </div>
                        </div>
                        <div className="col-xl-3">
                            <div className="lw-cta-btn text-xl-end">
                                <Link className="tp-btn-radius d-inline-flex align-items-center justify-content-between" href="/contact-us">
                                    <span>
                                        <span className="text-1">Contract us</span>
                                        <span className="text-2">Contract us</span>
                                    </span>
                                    <i>
                                        <span>
                                            <ArrowIconSeven />
                                            <ArrowIconSeven />
                                        </span>
                                    </i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerAgencyCta;