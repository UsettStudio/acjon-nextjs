
import JobApplicationForm from "@/components/form/JobApplicationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Job Application Form - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <div className="tp-application-form-spacing">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="tp-application-form-wrap">
                                <div className="tp-application-form-title-wrap mb-50 text-center">
                                    <span className="tp-section-subtitle fs-13 st-unbounded st-dot st-border tp_fade_anim" data-delay=".3">Full Time</span>
                                    <h2 className="tp-section-title fs-42 tp-split-title">UI/UX Designer</h2>
                                </div>
                                <div className="tp-application-form tp_fade_anim" data-delay=".5">
                                    <JobApplicationForm />
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