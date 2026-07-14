import { getCurrentYear } from '@/utils/getCurrentYear';
import Link from 'next/link';

const PersonalPFooterCopyright = () => {
    return (
        <div className="tp-footer-10-copyright-wrap pb-30">
            <div className="row">
                <div className="col-md-6">
                    <div className="tp-footer-10-copyright-text">
                        <p>{getCurrentYear()} <Link href="https://themeforest.net/user/aqlova/">Aqlova</Link> © All rights reserved</p>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="tp-footer-10-copyright-menu text-md-end">
                        <Link className="tp-hover-line-white" href="#">Privacy</Link>
                        <Link className="tp-hover-line-white" href="#">Policy</Link>
                        <Link className="tp-hover-line-white" href="#">terms</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalPFooterCopyright;