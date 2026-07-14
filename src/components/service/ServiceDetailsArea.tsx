import Image from "next/image";

const ServiceDetailsArea = () => {
    return (
        <div className="service-details-style pt-155">
            <div className="container">
                <div className="service-details-border pb-45">
                    <div className="row">
                        <div className="col-12">
                            <div className="service-details-content mb-65">
                                <h2 className="service-details-title mb-20 tp_fade_anim" data-delay=".3">A Deep Dive into Industry Trends</h2>
                                <p className="mb-25">At our core, we are more than just a team of professionals — we are thinkers, creators, and problem-solvers united by a passion for delivering exceptional
                                    results. We understand that today&apos;s world is driven by experiences, and we&apos;re here to help brands not only navigate that landscape but lead it with confidence.
                                    From the moment we begin a project, our mission is simple: to understand your goals, align with your vision, and deliver solutions that go beyond the ordinary.
                                    Every detail matters to us — from the first sketch to the final product — because we believe that excellence is found in the process, not just the outcome.</p>
                                <p>Whether {`you're`} launching a new business, reimagining your brand, or seeking strategic guidance, we bring a unique blend of creativity, insight, and experience
                                    to the table. We {`don't`} believe in one-size-fits-all solutions — instead, we tailor every project to your unique needs.</p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="service-details-content mr-50 mb-30">
                                <h2 className="service-details-title mb-20">Our Approach</h2>
                                <p className="mb-25">You need the best person for the job, wherever they&apos;re located. We
                                    provide support, payroll tax management, and compliance management
                                    for remote multi multi-location, and international employees.</p>
                                <div className="service-details-list">
                                    <ul>
                                        <li>
                                            <span className="mb-10">We Begin with Your Vision and Goals</span>
                                            <p>You need the best person for the job, wherever they&apos;re located.</p>
                                        </li>
                                        <li>
                                            <span className="mb-10">Creative Thinking that Solves Real Problems</span>
                                            <p>Creativity isn&apos;t just about visuals — it&apos;s about finding smart.</p>
                                        </li>
                                        <li>
                                            <span className="mb-10">Deep Discovery & Research-Driven Insights</span>
                                            <p>We use modern, scalable tools and platforms that empower</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="service-details-thumb tp-clip-anim mb-30 text-lg-end">
                                <Image width={612} height={393} className="w-100 tp-anim-img" data-animate="true" data-speed=".8" src="/assets/img/inner-image/service/details/thumb.jpg" alt="thumb image" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailsArea;