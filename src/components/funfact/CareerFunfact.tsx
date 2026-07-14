import AnimatedCounter from "../shared/Counter/AnimatedCounter";

const CareerFunfact = () => {
    const funFacts = [
        { end: 24, suffix: "+", label: "Agency Experience" },
        { end: 155, suffix: "+", label: "Successfully Project" },
        { end: 12, suffix: "+", label: "Team Members" },
        { end: 98, suffix: "%", label: "Clients Satisfied" },
    ];

    return (
        <div className="bnc-funfact-ptb pb-150">
            <div className="container container-1510">
                <div className="bnc-funfact-wrapper p-relative">
                    <div className="bnc-funfact-text-wrap">
                        <h4 className="bnc-funfact-text-title">
                            We&apos;ve 5,000+ Happiest Customers
                        </h4>
                    </div>
                    <div className="row">
                        {funFacts.map((fact, index) => (
                            <div key={index} className="col-lg-3 col-sm-6">
                                <div className="cr-funfact-item">
                                    <div className="cr-funfact-inner">
                                        <h4>
                                            <AnimatedCounter min={1} max={fact.end}/>
                                            {fact.suffix}
                                        </h4>
                                        <span>{fact.label}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerFunfact;
