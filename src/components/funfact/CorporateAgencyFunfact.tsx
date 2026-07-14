import { AchievementIcon, CustomerIcon, ExperienceIcon, ProjectIcon } from '@/svg/FunfactIcons';
import AnimatedCounter from '../shared/Counter/AnimatedCounter';

const funFacts = [
    {
        icon: <ProjectIcon />,
        end: 2,
        suffix: "k",
        label: "Project Completed",
        delay: ".3",
        defaultValue: "2",
    },
    {
        icon: <AchievementIcon />,
        end: 6,
        suffix: "",
        label: "My Achievement",
        delay: ".5",
        defaultValue: "06",
    },
    {
        icon: <ExperienceIcon />,
        end: 12,
        suffix: "+",
        label: "Year of Experience",
        delay: ".7",
        defaultValue: "12",
    },
    {
        icon: <CustomerIcon />,
        end: 98,
        suffix: "%",
        label: "Happy Customer",
        delay: ".9",
        defaultValue: "98",
    },
];

const CorporateAgencyFunfact = () => {
    return (
        <div className="cr-funfact-area pb-90">
            <div className="container container-1510">
                <div className="row">
                    {funFacts.map((fact, index) => (
                        <div className="col-xl-3 col-md-6" key={index}>
                            <div className="cr-funfact-item tp_fade_anim" data-delay={fact.delay}>
                                <i>{fact.icon}</i>
                                <div className="cr-funfact-inner">
                                    <h4>
                                        <AnimatedCounter min={0} max={fact.end} />
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
    );
};

export default CorporateAgencyFunfact;
