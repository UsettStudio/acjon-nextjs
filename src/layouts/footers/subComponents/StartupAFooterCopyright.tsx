import { getCurrentYear } from '@/utils/getCurrentYear';
import Link from 'next/link';

const StartupAFooterCopyright = () => {
    return (
        <div className="ds-copyright-area">
            <div className="container container-1510">
                <div className="ds-copyright-wrap sa-footer-copyright-wrap">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="tp-copyright-text">
                                <p>{getCurrentYear()} <Link className="tp-line-black" href="https://themeforest.net/user/aqlova/">Aqlova</Link> © All rights reserved</p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="tp-copyright-menu text-lg-end">
                                <Link className="tp-line-black" href="#">terms & Conditions</Link>
                                <Link className="tp-line-black" href="#">Privacy Policy</Link>
                                <Link className="tp-line-black" href="#">Legal</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartupAFooterCopyright;