import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "404 Page - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <div className="tp-error-area pt-190 pb-120">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="tp-error-wrapper text-center">
                                <h4 className="tp-error-title">Oops!</h4>
                                <Image className='img-fluid w-auto h-auto' width={866} height={340} src="/assets/img/shop/shop-home/error.png" alt="404 image" />
                                <div className="tp-error-content">
                                    <h4 className="tp-error-title-sm">Something went Wrong...</h4>
                                    <p>Sorry, we {`couldn't`} find your page.</p>
                                    <Link className="tp-btn tp-btn-anim" href="/">
                                        <div className="tp-btn-text">Back to Home</div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default page;