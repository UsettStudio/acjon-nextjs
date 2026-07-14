import { getCurrentYear } from '@/utils/getCurrentYear';
import Link from 'next/link';

const DesignSFooterCopyright = () => {
    return (
        <div className="ds-copyright-wrap">
            <div className="row">
                <div className="col-lg-6">
                    <div className="tp-copyright-text">
                        <p>{getCurrentYear()} <Link className="tp-line-white" href="/">Usett ©</Link> Alle rettigheter reservert</p>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="tp-copyright-menu text-lg-end">
                        <Link className="tp-hover-line-white" href="#">Vilkår</Link>
                        <Link className="tp-hover-line-white" href="#">Personvern</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignSFooterCopyright;