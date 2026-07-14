import RegisterForm from "@/components/form/RegisterForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Register - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <section className="tp-login-area pt-180 pb-140 p-relative z-index-1 fix">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-6 col-lg-8">
                            <div className="tp-login-wrapper">
                                <div className="tp-login-top text-center mb-30">
                                    <h3 className="tp-login-title">Sign Up Acjon.</h3>
                                    <p>Don&apos;t have an account? <span><Link href="/login">Sign In</Link></span></p>
                                </div>
                                {/* Register from  */}
                                <RegisterForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default page;