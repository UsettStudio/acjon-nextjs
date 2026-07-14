import { CheckIconFive } from "@/svg/CheckIcons";

const CareerValueArea = () => {
    const values = [
        {
            title: "Client Success is Our Success",
            description: "We push boundaries and think outside the box to craft innovative solutions. Every project is an opportunity to explore new ideas and elevate brands.",
            delay: ".3"
        },
        {
            title: "Collaboration & Teamwork",
            description: "We believe in the power of working together. Sharing ideas, supporting each other, and fostering teamwork drives the best outcomes.",
            delay: ".5"
        },
        {
            title: "Excellence & Quality",
            description: "We are committed to delivering top-notch results. Excellence and quality guide every decision we make and every project we undertake.",
            delay: ".7"
        }
    ];

    return (
        <div className="tp-career-inner-value-ptb pt-150 pb-150">
            <div className="container">
                <div className="row">
                    <div className="col-lg-6">
                        <div className="tp-career-inner-value-heading">
                            <h4 className="tp-section-title fs-42 tl-unbounded fw-600 tt-capitalize mb-20 tp-split-title">
                                Fuel Your Passion <br /> with Meaningful Work
                            </h4>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="tp-career-inner-value-wrap">
                            {values.map((value, index) => (
                                <div
                                    key={index}
                                    className="tp-career-inner-value-item tp_fade_anim"
                                    data-delay={value.delay}
                                >
                                    <h4 className="tp-career-inner-value-title">
                                        <span><CheckIconFive /></span>
                                        {value.title}
                                    </h4>
                                    <p>{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerValueArea;
