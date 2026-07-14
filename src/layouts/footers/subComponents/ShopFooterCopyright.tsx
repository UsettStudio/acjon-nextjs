import { getCurrentYear } from "@/utils/getCurrentYear";
import Image from "next/image";
import Link from "next/link";

const ShopFooterCopyright = () => {
    return (
        <div className="tp-copyright-wrap">
            <div className="row align-items-center">
                <div className="col-lg-6">
                    <div className="tp-copyright-text">
                        <p>{getCurrentYear()} <Link href="https://themeforest.net/user/aqlova/">Aqlova ©</Link> All rights reserved</p>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="tp-copyright-payment text-lg-end">
                        <Image width={232} height={30} src="/assets/img/shop/shop-home/footer-payment.png" alt="white logo" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopFooterCopyright;