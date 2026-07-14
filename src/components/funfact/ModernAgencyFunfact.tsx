import AnimatedCounter from "../shared/Counter/AnimatedCounter";

interface Funfact {
    id: number;
    title: string;
    count: number;
    duration: number;
    suffix?: string;
    delay?: string;
    description: string;
}

const funfacts: Funfact[] = [
    {
        id: 1,
        title: "Awards",
        count: 158,
        duration: 3,
        suffix: "+",
        description:
            "Partnering with this agency has been a transformative experience for our business.",
    },
    {
        id: 2,
        title: "Clients",
        count: 3,
        duration: 2,
        suffix: "m+",
        delay: ".4",
        description:
            "Partnering with this agency has been a transformative experience for our business.",
    },
    {
        id: 3,
        title: "Members",
        count: 15,
        duration: 2,
        suffix: "K+",
        delay: ".5",
        description:
            "Partnering with this agency has been a transformative experience for our business.",
    },
];

const ModernAgencyFunfact = () => {
    return (
        <section className="ma-funfact-ptb pb-130">
            <div className="container container-1510">
                <div className="row">
                    {funfacts.map(({ id, title, count, suffix, delay, description }) => (
                        <div key={id} className="col-xl-4 col-md-6">
                            <div
                                className={`ma-funfact-item d-flex align-items-start mb-30 ${delay ? "tp_fade_anim" : ""
                                    }`}
                                {...(delay ? { "data-delay": delay } : {})}
                            >
                                <span className="ma-funfact-subtitle">{title}</span>
                                <div className="ma-funfact-content">
                                    <h4>
                                        <AnimatedCounter min={0} max={count} />
                                        {suffix && `${suffix}`}
                                    </h4>
                                    <p>{description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ModernAgencyFunfact;
