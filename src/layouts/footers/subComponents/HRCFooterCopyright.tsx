import { getCurrentYear } from '@/utils/getCurrentYear';
import Link from 'next/link';

const HRCFooterCopyright = () => {
    return (
        <div className="ds-copyright-wrap">
            <div className="row">
                <div className="col-xl-12">
                    <div className="tp-copyright-text tp-copyright-4 text-center">
                        <p>{getCurrentYear()} <Link className="tp-line-white" href="https://themeforest.net/user/aqlova/">Aqlova ©</Link> All rights reserved</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRCFooterCopyright;