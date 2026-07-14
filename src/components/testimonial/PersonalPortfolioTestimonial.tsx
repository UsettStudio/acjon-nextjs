import PersonalPTestiItem from './subComponents/PersonalPTestiItem';
import testimonialsData from '@/data/testimonialData';

const PersonalPortfolioTestimonial = () => {
    return (
        <div
            className="d-flex align-items-center justify-content-center h-100"
            style={{ backgroundColor: '#0e0905' }}
        >
            <div className="tp-testimonial-pp-wrap pt-60 pb-60 fix">
                <div className="container h-100">
                    {/* Section Title */}
                    <div className="row align-items-end h-100">
                        <div className="col-lg-7">
                            <div className="tp-pp-testimonial-title-wrap mb-35">
                                <h4 className="tp-about-me-service-title mb-15 d-inline-block">
                                    Testimonial
                                </h4>
                                <h2 className="tp-testimonial-pp-title">
                                    {`We're`} trusted by the most <br /> important teams.
                                </h2>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="tp-about-me-hero-work text-lg-end mb-35">
                                <span className="mb-15">7K customers</span>
                                <span className="ml-35 mb-15">99% satisfaction</span>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial Items */}
                    <div className="row">
                        {testimonialsData.slice(24, 26).map((item, index) => (
                            <PersonalPTestiItem {...item} key={index} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalPortfolioTestimonial;
