import { AchievementIcon, CustomerIcon, ExperienceIcon, ProjectIcon } from '@/svg/FunfactIcons';
import AnimatedCounter from '../shared/Counter/AnimatedCounter';

const funfactData = [
    {
        id: 1,
        value: 2,
        text: 'Project Completed',
        suffix: 'k',
        delay: '.3',
        icon: <ProjectIcon />,
        default: 2,
    },
    {
        id: 2,
        value: 6,
        text: 'My Achievement',
        suffix: '',
        delay: '.5',
        icon: <AchievementIcon />,
        default: 6,
    },
    {
        id: 3,
        value: 12,
        text: 'Year of Experience',
        suffix: '+',
        delay: '.7',
        icon: <ExperienceIcon />,
        default: 12,
    },
    {
        id: 4,
        value: 98,
        text: 'Happy Customer',
        suffix: '%',
        delay: '.9',
        icon: <CustomerIcon />,
        default: 98,
    },
];

const HomeFunfact = () => {

    return (
        <div className="tp-funfact-ptb pb-120">
            <div className="container container-1510">
                <div className="tp-funfact-wrap d-flex align-items-center justify-content-center">
                    {funfactData.map((item) => (
                        <div
                            key={item.id}
                            className="tp-funfact-item tp_fade_anim"
                            data-delay={item.delay}
                            data-ease="bounce"
                            data-fade-from="top"
                            data-duration="1"
                        >
                            <h4>
                                <AnimatedCounter min={0} max={item.value}/>
                                {item.suffix}
                            </h4>
                            <span>{item.text}</span>
                            <i>{item.icon}</i>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeFunfact;
