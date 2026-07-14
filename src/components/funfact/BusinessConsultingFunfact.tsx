import AnimatedCounter from '../shared/Counter/AnimatedCounter';

// Funfact Data
const funfactData = [
    {
        id: 1,
        endValue: 24,
        suffix: '+',
        label: 'Agency Experience',
    },
    {
        id: 2,
        endValue: 155,
        suffix: '+',
        label: 'Successfully Project',
    },
    {
        id: 3,
        endValue: 12,
        suffix: '+',
        label: 'Team Members',
    },
    {
        id: 4,
        endValue: 98,
        suffix: '%',
        label: 'Clients Satisfied',
    },
];

const BusinessConsultingFunfact = () => {
    return (
        <div className="bnc-funfact-ptb pt-170 pb-150">
            <div className="container container-1510">
                <div className="bnc-funfact-wrapper p-relative">
                    {/* Header Text */}
                    <div className="bnc-funfact-text-wrap">
                        <h4 className="bnc-funfact-text-title">
                            {`We've`} 5,000+ Happiest Customers
                        </h4>
                    </div>

                    {/* Funfact Grid */}
                    <div className="row">
                        {funfactData.map((item) => (
                            <div key={item.id} className="col-lg-3 col-sm-6">
                                <div className="cr-funfact-item">
                                    <div className="cr-funfact-inner">
                                        <h4>
                                            <AnimatedCounter min={0} max={item.endValue} />
                                            {item.suffix}
                                        </h4>
                                        <span>{item.label}</span>
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

export default BusinessConsultingFunfact;
