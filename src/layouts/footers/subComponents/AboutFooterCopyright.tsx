import { getCurrentYear } from "@/utils/getCurrentYear";
import Link from "next/link";

const AboutFooterCopyright = () => {
    return (
        <div className="tp-footer-3-copyright-area">
            <div className="container container-1510">
                <div className="ds-copyright-wrap">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="tp-footer-3-copyright-text text-center">
                                <p>{getCurrentYear()} <Link className="tp-line-black" href="https://themeforest.net/user/aqlova/">Aqlova</Link> © All rights reserved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutFooterCopyright;