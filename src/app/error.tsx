'use client'

import { useEffect } from "react";
import Image from 'next/image';

//global boundary error
export default function Error({ error, reset }: {
    error: Error;
    reset: () => void;
}) {
    useEffect(() => {
    }, [error]);
    return (
        <main>
            <div className="tp-error-area pt-190 pb-120">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="tp-error-wrapper text-center">
                                <Image width={650} height={400} className='img-fluid w-auto h-auto' src="/assets/img/error/fixing-bugs.jpg" alt="error" />
                                <h1 className="title">Something went wrong</h1>
                                <p className="text">
                                    {error?.message}
                                </p>
                                <div className="tp-error-content">
                                    <button className='tp-btn' onClick={() => reset()}>
                                        Try again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}