import Image from 'next/image';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Acjon - 404 Not Found Page",
};

export default function NotFound() {
    return (
        <main>
            <div className="tp-error-area pt-190 pb-120">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="tp-error-wrapper text-center">
                                <h4 className="tp-error-title">Oops!</h4>
                                <Image className='img-fluid w-auto h-auto' width={866} height={340} src="/assets/img/shop/shop-home/error.png" alt="error" />
                                <div className="tp-error-content">
                                    <h4 className="tp-error-title-sm">Something went Wrong...</h4>
                                    <p>Sorry, we {`couldn't`} find your page.</p>
                                    <Link className="tp-btn" href="/">Back to Home</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}